import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
	SequelizeProvider,
} from "discord-akairo";
import {
	Collection,
	Message,
	Guild,
	MessageOptions,
	TextChannel,
	Intents,
	Snowflake,
	VoiceChannel,
} from "discord.js";
import { Shoukaku, Libraries } from "shoukaku";
import { LavasfyClient } from "lavasfy";
import Logger from "./Logger";
import { Job } from "node-schedule";
import ms from "ms";
import moment from "moment";

import Command from "./Command";

import Db from "../utils/db";
import Trivia from "./Trivia";
import Economy from "./Economy";
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
	player: any | null;
	tracks: any[];
	paused: boolean;
	loop: boolean;
}

type voiceStateCollection = Collection<
	Snowflake,
	Collection<
		Snowflake,
		{
			channel: VoiceChannel;
			owner: Snowflake;
		}
	>
>;

// Bruh
declare module "discord-akairo" {
	interface AkairoClient {
		db: Db;
		commandHandler: CommandHandler;
		starboardMessages: Collection<string, Message>;
		config: any;
		emoji: any;
		generateUsage: Function;
		economy: Economy;
		trivia: Trivia;
		settings: SequelizeProvider;
		shoukaku: Shoukaku;
		lavasfy: LavasfyClient;
		queue: Collection<string, Queue>;
		log: Logger;
		jobs: Map<string, Map<string, Job>>;
		invites: Collection<string, any>;
		voiceLobbies: voiceStateCollection;
		sendToLogChannel(
			options: MessageOptions,
			guild: Guild
		): Promise<Message | null | undefined>;
	}
}

export default class RyukoClient extends AkairoClient {
	public db: Db;
	public config: any;
	public emoji: any;
	public generateUsage: Function;
	public economy: Economy;
	public trivia: Trivia;
	public settings: SequelizeProvider;
	public shoukaku: Shoukaku;
	public lavasfy: LavasfyClient;
	public queue: Collection<string, Queue>;
	public log: Logger;
	public voiceLobbies: voiceStateCollection;
	public jobs: Collection<string, Map<string, Job>>;
	public starboardMessages: Collection<string, Message>;
	public invites: Collection<string, any>;
	public commandHandler: CommandHandler;
	private inhibitorHandler: InhibitorHandler;
	private listenerHandler: ListenerHandler;

	constructor(log: Logger) {
		super(
			{
				ownerID: config.ownerId,
			},
			{
				intents: [
					Intents.FLAGS.GUILDS,
					Intents.FLAGS.GUILD_MESSAGES,
					Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
					Intents.FLAGS.GUILD_BANS,
					Intents.FLAGS.GUILD_INVITES,
					Intents.FLAGS.GUILD_MEMBERS,
					Intents.FLAGS.GUILD_VOICE_STATES,
				],
			}
		);
		this.config = config;
		this.emoji = emojis;
		this.trivia = new Trivia("../../app/data/trivia");
		this.generateUsage = generateUsage;
		this.log = log;
		this.jobs = new Collection();
		this.invites = new Collection();
		this.voiceLobbies = new Collection();
		this.starboardMessages = new Collection();

		this.db = new Db();
		this.economy = new Economy("../../app/data", this.db);
		this.settings = this.db.getSettings();

		this.shoukaku = new Shoukaku(
			new Libraries.DiscordJS(this),
			config.lavalink,
			ShoukakuOptions
		);

		const lavalinkConfig = (): any[] => {
			let nodes = [];
			let node;
			for (let i = 0; (node = config.lavalink[i]); i++) {
				const splitted = (<string>node.url).split(":");
				nodes.push({
					id: node.name,
					host: splitted[0],
					port: splitted[1],
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

		this.commandHandler.resolver.addType("ms", (message, phrase) => {
			if (!phrase) return null;

			return ms(phrase);
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
		const log = new Logger({
			name: "lavalink",
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
		this.shoukaku.on("disconnect", (name, reason) =>
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

	async sendToLogChannel(
		options: MessageOptions,
		guild: Guild
	): Promise<Message | null | undefined> {
		if (
			!this.settings.get(guild.id, "logging", false) &&
			this.settings.get(guild.id, "loggingChannel", null)
		)
			return null;

		const loggingChannel = (await guild.channels.fetch(
			this.settings.get(guild.id, "loggingChannel", null)
		)) as TextChannel | null;

		return loggingChannel?.send(options);
	}
}
