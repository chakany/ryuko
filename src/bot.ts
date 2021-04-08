import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
	SequelizeProvider,
} from "discord-akairo";
import { Shoukaku } from "shoukaku";

import Db from "./db";

import Queue from "./utils/queue";

const config = require("../config.json");

const ShoukakuOptions = {
	moveOnDisconnect: false,
	resumable: false,
	resumableTimeout: 30,
	reconnectTries: 2,
	restTimeout: 10000,
};

export default class Bot extends AkairoClient {
	public config: any;
	public settings: SequelizeProvider;
	public shoukaku;
	public queue;
	private commandHandler: CommandHandler;
	private inhibitorHandler: InhibitorHandler;
	private listenerHandler: ListenerHandler;

	constructor() {
		Db.sync();

		super(
			{
				ownerID: config.ownerId,
			},
			{
				disableMentions: "everyone",
			}
		);

		this.config = config;

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
		});

		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: "./inhibitors",
		});

		this.listenerHandler = new ListenerHandler(this, {
			directory: "./listeners",
		});

		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);

		this.listenerHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.commandHandler.loadAll();
	}

	_setupShoukakuEvents() {
		this.shoukaku.on("ready", (name) =>
			console.log(`Lavalink ${name}: Ready!`)
		);
		this.shoukaku.on("error", (name, error) =>
			console.error(`Lavalink ${name}: Error Caught,`, error)
		);
		this.shoukaku.on("close", (name, code, reason) =>
			console.warn(
				`Lavalink ${name}: Closed, Code ${code}, Reason ${
					reason || "No reason"
				}`
			)
		);
		this.shoukaku.on("disconnected", (name, reason) =>
			console.warn(
				`Lavalink ${name}: Disconnected, Reason ${reason || "No reason"}`
			)
		);
	}

	start(): this {
		this._setupShoukakuEvents();
		this.login(this.config.token);
		this.on("disconnect", () => console.log("Disconnected!"));

		return this;
	}

	async login(token: string) {
		await this.settings.init();
		return super.login(token);
	}
}
