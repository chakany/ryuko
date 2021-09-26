import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
	SequelizeProvider,
} from "@ryukobot/discord-akairo";
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
import path from "path";
import { Shoukaku, Libraries } from "shoukaku";
import { LavasfyClient } from "lavasfy";
import Logger from "./Logger";
import { Job } from "node-schedule";
import ms from "ms";
import moment from "moment";

import Command from "./Command";

import Db from "../utils/db";
import Trivia from "./Trivia";
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

export type LogType = "member" | "message" | "voice" | "guild";
export type JobsType = { mutes: Collection<string, Collection<string, Job>> };

// Bruh
declare module "@ryukobot/discord-akairo" {
	interface AkairoClient {
		db: Db;
		commandHandler: CommandHandler;
		starboardMessages: Collection<string, Message>;
		config: any;
		emoji: any;
		generateUsage: Function;
		trivia: Trivia;
		settings: SequelizeProvider;
		shoukaku: Shoukaku;
		lavasfy: LavasfyClient;
		queue: Collection<string, Queue>;
		log: Logger;
		jobs: JobsType;
		invites: Collection<string, any>;
		voiceLobbies: voiceStateCollection;
		sendToLogChannel(
			guild: Guild,
			type: LogType,
			options: MessageOptions
		): Promise<Message | null | undefined>;
		listenerHandler: ListenerHandler;
		inhibitorHandler: InhibitorHandler;
	}
}

export default class RyukoClient extends AkairoClient {
	public db: Db;
	public config: any;
	public emoji: any;
	public generateUsage: Function;
	public trivia: Trivia;
	public settings: SequelizeProvider;
	public shoukaku: Shoukaku;
	public lavasfy: LavasfyClient;
	public queue: Collection<string, Queue>;
	public log: Logger;
	public voiceLobbies: voiceStateCollection;
	public jobs: JobsType;
	public starboardMessages: Collection<string, Message>;
	public invites: Collection<string, any>;
	public commandHandler: CommandHandler;
	public inhibitorHandler: InhibitorHandler;
	public listenerHandler: ListenerHandler;

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
		this.jobs = {
			mutes: new Collection(),
		};
		this.invites = new Collection();
		this.voiceLobbies = new Collection();
		this.starboardMessages = new Collection();

		this.db = new Db();
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
			directory: path.resolve(__dirname, "../commands"),
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
			// @ts-expect-error
			ignorePermissions: (message: Message, command: Command) => {
				if (this.isOwner(message.author.id)) return true;
				else if (
					command.userPermissions &&
					(command.adminOnly || command.modOnly) &&
					(message.member!.roles.cache.has(
						this.settings.get(message.guild!.id, "adminRole", null)
					) ||
						message.member!.roles.cache.has(
							this.settings.get(
								message.guild!.id,
								"modRole",
								null
							)
						))
				)
					return true;

				return false;
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
			directory: path.resolve(__dirname, "../inhibitors"),
		});

		this.listenerHandler = new ListenerHandler(this, {
			directory: path.resolve(__dirname, "../listeners"),
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

	private _setupShoukakuEvents() {
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
		guild: Guild,
		type: LogType,
		options: MessageOptions
	): Promise<Message | null | undefined> {
		const guildChannels = await guild.channels.fetch();
		let channel: TextChannel;

		switch (type) {
			case "guild":
				if (!this.settings.get(guild.id, "guildLogs", false)) return;

				if (
					!this.settings.get(guild.id, "guildLogsChannel", null) ||
					!guildChannels.get(
						this.settings.get(guild.id, "guildLogsChannel", null)
					)
				)
					return;

				channel = guildChannels.get(
					this.settings.get(guild.id, "guildLogsChannel", null)
				) as TextChannel;
				break;

			case "member":
				if (!this.settings.get(guild.id, "memberLogs", false)) return;

				if (
					!this.settings.get(guild.id, "memberLogsChannel", null) ||
					!guildChannels.get(
						this.settings.get(guild.id, "memberLogsChannel", null)
					)
				)
					return;

				channel = guildChannels.get(
					this.settings.get(guild.id, "memberLogsChannel", null)
				) as TextChannel;
				break;

			case "message":
				if (!this.settings.get(guild.id, "messageLogs", false)) return;

				if (
					!this.settings.get(guild.id, "messageLogsChannel", null) ||
					!guildChannels.get(
						this.settings.get(guild.id, "messageLogsChannel", null)
					)
				)
					return;

				channel = guildChannels.get(
					this.settings.get(guild.id, "messageLogsChannel", null)
				) as TextChannel;
				break;

			case "voice":
				if (!this.settings.get(guild.id, "voiceLogs", false)) return;

				if (
					!this.settings.get(guild.id, "voiceLogsChannel", null) ||
					!guildChannels.get(
						this.settings.get(guild.id, "voiceLogsChannel", null)
					)
				)
					return;

				channel = guildChannels.get(
					this.settings.get(guild.id, "voiceLogsChannel", null)
				) as TextChannel;
				break;
		}

		channel.send(options);
	}
}
