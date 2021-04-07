import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
	SequelizeProvider,
} from "discord-akairo";

import Db from "./db";

const config = require("../config.json");

export default class Bot extends AkairoClient {
	public config: any;
	public settings: SequelizeProvider;
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

	start(): this {
		this.login(this.config.token);
		this.on("disconnect", () => console.log("Disconnected!"));

		return this;
	}

	async login(token: string) {
		await this.settings.init();
		return super.login(token);
	}
}
