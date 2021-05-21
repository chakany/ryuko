import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
	SequelizeProvider,
	Command,
} from "discord-akairo";
import { Collection, Message, MessageEmbed } from "discord.js";
import { Shoukaku, ShoukakuPlayer, ShoukakuTrack } from "shoukaku";
import bunyan from "bunyan";
import client from "nekos.life";
import { Job } from "node-schedule";

import Db from "../utils/db";

const config = require("../../config.json");

const ShoukakuOptions = {
	moveOnDisconnect: false,
	resumable: true,
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

declare module "discord-akairo" {
	interface AkairoClient {
		db: Db;
		commandHandler: CommandHandler;
		config: any;
		settings: SequelizeProvider;
		shoukaku: Shoukaku;
		queue: Collection<string, Queue>;
		log: bunyan;
		jobs: Map<string, Map<string, Job>>;
		hentai: client;
		error(
			message: Message,
			command: Command,
			error: string,
			description: string
		): MessageEmbed;
	}

	interface Command {
		args?: any;
		modOnly: boolean;
		nsfw: boolean;
		guild: string[];
	}

	interface CommandOptions {
		modOnly?: boolean;
		nsfw?: boolean;
		guild?: string[];
	}
}

export default class AinaClient extends AkairoClient {
	public db: Db;
	public config: any;
	public settings: SequelizeProvider;
	public shoukaku: Shoukaku;
	public queue: Collection<string, Queue>;
	public log: bunyan;
	public jobs: Collection<string, Map<string, Job>>;
	public hentai: client;
	public commandHandler: CommandHandler;
	private inhibitorHandler: InhibitorHandler;
	private listenerHandler: ListenerHandler;

	constructor(log: bunyan, full = true) {
		super(
			{
				ownerID: config.ownerId,
			},
			{
				disableMentions: "everyone",
			}
		);
		const newHentai = new client();

		this.config = config;
		this.log = log;
		this.jobs = new Collection();
		this.hentai = newHentai;

		this.db = new Db();
		this.settings = this.db.getSettings();

		this.shoukaku = new Shoukaku(this, config.lavalink, ShoukakuOptions);
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
			ignorePermissions: config.ownerId,
			ignoreCooldown: config.ownerId,
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
		this.on("disconnect", () => this.log.warn("Disconnected!"));

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
		let current;
		let usage: string = `${prefix}${command.id}`;
		// @ts-ignore
		if (command.args)
			// @ts-ignore
			for (let i = 0; (current = command.args[i]); i++) {
				usage = usage + ` <${current.id}>`;
			}
		return new MessageEmbed({
			title: ":x:Error: `" + command.id + "`",
			description: "```diff\n- " + error + "\n+ " + description + "```",
			color: message.guild?.me?.displayHexColor,
			timestamp: new Date(),
			footer: {
				text: message.author.tag,
				icon_url: message.author.displayAvatarURL({ dynamic: true }),
			},
			fields: [
				{
					name: "Usage",
					value: "`" + usage + "`",
				},
			],
		});
	}
}
