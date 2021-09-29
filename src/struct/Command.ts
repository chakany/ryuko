import {
	Command as AkairoCommand,
	ArgumentOptions,
	ArgumentGenerator,
} from "@ryukobot/discord-akairo";
import { CommandOptions } from "./Command.d";
import { Message, MessageEmbedOptions } from "discord.js";
import { generateUsage } from "../utils/command";
import Embed from "./Embed";
import Client from "./Client";
import ms from "ms";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prefix } = require("../../config.json");

export default class Command extends AkairoCommand {
	public override client!: Client;
	public modOnly: boolean;
	public adminOnly: boolean;
	public nsfw: boolean;
	public guild: string[];
	public args?: ArgumentOptions[] | ArgumentGenerator;
	public formattedCooldown: string | null;
	public usage: string;

	constructor(id: string, options?: CommandOptions) {
		super(id, options);

		const {
			modOnly = false,
			adminOnly = false,
			nsfw = false,
			guild = [],
			args,
			cooldown,
		} = options!;

		/**
		 * Usable only by discord mods.
		 * @type {boolean}
		 */
		this.modOnly = modOnly;

		/**
		 * Usable only by discord admins.
		 * @type {boolean}
		 */
		this.adminOnly = adminOnly;

		/**
		 * Whether or not the command is NSFW.
		 * @type {boolean}
		 */
		this.nsfw = nsfw;

		/**
		 * Guilds the command can be used in.
		 * @type {string[]}
		 */
		this.guild = guild;

		this.formattedCooldown = cooldown ? ms(cooldown, { long: true }) : null;

		this.args = args;

		// For website usage
		this.usage = generateUsage(this, prefix);
	}

	embed(options: MessageEmbedOptions, message: Message): Embed {
		return new Embed(options, message.author, message.guild!);
	}

	error(message: Message, error: string, description: string): Embed {
		return new Embed(
			{
				title: error,
				description: description,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: `Use the "${message.util?.parsed?.prefix}${
						this.handler.findCommand("support").aliases[0]
					}" command if you would like to report this error\n${
						message.author.tag
					}`,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				author: {
					name: `❌ Error: ${message.util?.parsed?.alias}`,
					url: `${this.client.config.siteUrl}/commands/${this.categoryID}/${this.id}`,
				},
				fields: [
					{
						name: "Usage",
						value: "`" + this.usage + "`",
					},
				],
			},
			message.author,
			message.guild!,
		);
	}
}
