import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
	SequelizeProvider,
} from "discord-akairo";
import { Collection, Message, MessageEmbed } from "discord.js";
import { Shoukaku, ShoukakuPlayer, ShoukakuTrack } from "shoukaku";
import { LavasfyClient } from "lavasfy";
import bunyan from "bunyan";
import { Job } from "node-schedule";
import ms from "ms";
import moment from "moment";

import Command from "./Command";

import Db from "../utils/db";
import Redis from "../utils/redis";
import Trivia from "../utils/trivia";
import { generateUsage } from "../utils/command";

const config = require("../../config.json");
const emojis = require("../../app/data/emojis.json");

const ShoukakuOptions = {
	moveOnDisconnect: false,
	resumable: false,
	resumableTimeout: 30,
	reconnectTries: 2,
	restTimeout: 10000,
};

interface Queue {
	player: ShoukakuPlayer | null;
	tracks: ShoukakuTrack[];
	paused: boolean;
	loop: boolean;
}

// Bruh
declare module "discord-akairo" {
	interface AkairoClient {
		db: Db;
		redis: Redis;
		commandHandler: CommandHandler;
		config: any;
		emoji: any;
		generateUsage: Function;
		trivia: Trivia;
		settings: SequelizeProvider;
		shoukaku: Shoukaku;
		lavasfy: LavasfyClient;
		queue: Collection<string, Queue>;
		log: bunyan;
		jobs: Map<string, Map<string, Job>>;
		invites: Collection<string, any>;
		error(
			message: Message,
			command: Command,
			error: string,
			description: string
		): MessageEmbed;
	}
}

export default class RyukoClient extends AkairoClient {
	public db: Db;
	public redis: Redis;
	public config: any;
	public emoji: any;
	public generateUsage: Function;
	public trivia: Trivia;
	public settings: SequelizeProvider;
	public shoukaku: Shoukaku;
	public lavasfy: LavasfyClient;
	public queue: Collection<string, Queue>;
	public log: bunyan;
	public jobs: Collection<string, Map<string, Job>>;
	public invites: Collection<string, any>;
	public commandHandler: CommandHandler;
	private inhibitorHandler: InhibitorHandler;
	private listenerHandler: ListenerHandler;

	constructor(log: bunyan) {
		super(
			{
				ownerID: config.ownerId,
			},
			{
				disableMentions: "everyone",
			}
		);
		this.config = config;
		this.emoji = emojis;
		this.trivia = new Trivia("../../app/data/trivia");
		this.generateUsage = generateUsage;
		this.log = log;
		this.jobs = new Collection();
		this.invites = new Collection();

		this.db = new Db();
		const redislog = bunyan.createLogger({ name: "redis" });
		this.redis = new Redis(redislog);
		this.redis.on("error", (error: any) => {
			redislog.error(error);
		});
		this.settings = this.db.getSettings();

		this.shoukaku = new Shoukaku(this, config.lavalink, ShoukakuOptions);
		const lavalinkConfig = (): any[] => {
			let nodes = [];
			let node;
			for (let i = 0; (node = config.lavalink[i]); i++) {
				nodes.push({
					id: node.name,
					host: node.host,
					port: node.port,
					password: node.auth,
				});
			}

			return nodes;
		};
		this.lavasfy = new LavasfyClient(config.spotify, lavalinkConfig());
		this.queue = new Collection();

		this.commandHandler = new CommandHandler(this, {
			directory: "./commands",
			prefix: (message) => {
				if (message.guild) {
					// The third param is the default.
					return this.settings.get(
						message.guild.id,
						"prefix",
						config.prefix
					);
				}

				return config.prefix;
			},
			aliasReplacement: /-/g,
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			// @ts-expect-error 2322
			ignorePermissions: (message: Message, command: Command) => {
				if (config.ownerId.includes(message.author.id)) return true;
				else if (
					command.modOnly &&
					command.userPermissions &&
					message.member!.roles.cache.has(
						this.settings.get(message.guild!.id, "modRole", null)
					)
				)
					return true;
				else return false;
			},
			ignoreCooldown: config.ownerId,
		});

		// Custom types

		this.commandHandler.resolver.addType("category", (message, phrase) => {
			if (!phrase) return null;

			for (const [name, category] of this.commandHandler.categories) {
				if (category.id.toLowerCase() === phrase.toLowerCase())
					return category;
			}

			return null;
		});

		this.commandHandler.resolver.addType("future", (message, phrase) => {
			if (!phrase) return null;

			return moment().add(ms(phrase), "ms");
		});

		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: "./inhibitors",
		});

		this.listenerHandler = new ListenerHandler(this, {
			directory: "./listeners",
		});

		this.listenerHandler.setEmitters({
			process: process,
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
		});

		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);

		this.listenerHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.commandHandler.loadAll();
	}

	_setupShoukakuEvents() {
		let log: bunyan;

		if (process.env.NODE_ENV !== "production")
			log = bunyan.createLogger({
				name: "lavalink",
				stream: process.stdout,
				level: "debug",
			});
		else
			log = bunyan.createLogger({
				name: "lavalink",
				stream: process.stdout,
			});

		this.shoukaku.on("ready", (name) => log.info(`[${name}] Connected.`));
		this.shoukaku.on("error", (name, error) =>
			log.error(`[${name}]`, error)
		);
		this.shoukaku.on("close", (name, code, reason) =>
			log.warn(
				`[${name}] Connection Closed. Code ${code}. Reason ${
					reason || "No reason"
				}`
			)
		);
		this.shoukaku.on("disconnected", (name, reason) =>
			log.warn(`[${name}] Disconnected. Reason ${reason || "No reason"}`)
		);
		this.shoukaku.on("debug", (name, data) =>
			log.debug(`[${name}] ` + JSON.stringify(data))
		);
	}

	async start(token: string): Promise<this> {
		this.log.info("Starting...");
		this._setupShoukakuEvents();
		this.login(token);

		return this;
	}

	async login(token: string) {
		await this.settings.init();
		return super.login(token);
	}

	error(
		message: Message,
		command: Command,
		error: string,
		description: string
	) {
		const prefix = message.util?.parsed?.prefix;
		return new MessageEmbed({
			title: error,
			description: description,
			color: message.guild?.me?.displayHexColor,
			timestamp: new Date(),
			footer: {
				text: `Use the "${message.util?.parsed?.prefix}${
					command.handler.findCommand("support").aliases[0]
				}" command if you need assistance\n${message.author.tag}`,
				icon_url: message.author.displayAvatarURL({ dynamic: true }),
			},
			author: {
				name: `❌ Error: ${command.aliases[0]}`,
				url: `${this.config.siteUrl}/commands/${command.categoryID}/${command.id}`,
			},
			fields: [
				{
					name: "Usage",
					value: "`" + this.generateUsage(command, prefix) + "`",
				},
			],
		});
	}
}
