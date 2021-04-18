import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
	SequelizeProvider,
} from "discord-akairo";
import { Shoukaku } from "shoukaku";
import bunyan from "bunyan";

import Db from "../utils/db";

const config = require("../../config.json");

const ShoukakuOptions = {
	moveOnDisconnect: false,
	resumable: false,
	resumableTimeout: 30,
	reconnectTries: 2,
	restTimeout: 10000,
};

declare module "discord-akairo" {
	interface AkairoClient {
		config: any;
		settings: SequelizeProvider;
		shoukaku: any;
		queue: any;
		log: bunyan;
	}
}

export default class AinaClient extends AkairoClient {
	public config: any;
	public settings: SequelizeProvider;
	public shoukaku;
	public queue;
	public log: bunyan;
	private commandHandler: CommandHandler;
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
		this.log = log;

		this.settings = Db.getSettings();

		this.shoukaku = new Shoukaku(this, config.lavalink, ShoukakuOptions);
		this.queue = new Map();

		this.commandHandler = new CommandHandler(this, {
			directory: "./commands",
			prefix: (message) => {
				if (message.guild) {
					// The third param is the default.
					return this.settings.get(message.guild.id, "prefix", config.prefix);
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
		});

		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);

		this.listenerHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.commandHandler.loadAll();
	}

	_setupShoukakuEvents() {
		let log = bunyan.createLogger({
			name: "lavalink",
			stream: process.stdout,
			level: "info",
		});

		this.shoukaku.on("ready", (name) => log.info(`${name} is ready to roll!`));
		this.shoukaku.on("error", (name, error) => log.error(error));
		this.shoukaku.on("close", (name, code, reason) =>
			log.warn(`${name} Closed, Code ${code}, Reason ${reason || "No reason"}`)
		);
		this.shoukaku.on("disconnected", (name, reason) =>
			log.warn(`Disconnected from ${name}, Reason ${reason || "No reason"}`)
		);
	}

	start(): this {
		this.log.info("Bot is starting...");
		this._setupShoukakuEvents();
		this.login(this.config.token);
		this.on("disconnect", () => this.log.warn("Disconnected!"));

		return this;
	}

	async login(token: string) {
		await this.settings.init();
		return super.login(token);
	}
}
