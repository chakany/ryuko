import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
} from "discord-akairo";

const config = require("../config.json");

export default class Bot extends AkairoClient {
	public config: any;
	private commandHandler: CommandHandler;
	private inhibitorHandler: InhibitorHandler;
	private listenerHandler: ListenerHandler;

	constructor() {
		super(
			{
				ownerID: config.ownerId,
			},
			{ disableMentions: "everyone" }
		);

		this.config = config;

		this.commandHandler = new CommandHandler(this, {
			directory: "./commands",
			prefix: (msg) => {
				return config.prefix;
			},
			aliasReplacement: /-/g,
			allowMention: true,
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
}
