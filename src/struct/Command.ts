import { Command as AkairoCommand, CommandOptions } from "discord-akairo";
import { generateUsage } from "../utils/command";
const { prefix } = require("../../config.json");
import ms from "ms";

interface Options extends CommandOptions {
	modOnly?: boolean;
	nsfw?: boolean;
	guild?: string[];
}

export default class Command extends AkairoCommand {
	public modOnly: boolean;
	public nsfw: boolean;
	public guild: string[];
	public args: any;
	public formattedCooldown: string | null;
	public usage: string;

	constructor(id: string, options: Options | undefined) {
		super(id, options);

		const {
			modOnly = false,
			nsfw = false,
			guild = [],
			args,
			cooldown,
		} = options!;

		/**
		 * Usable only by the discord mods.
		 * @type {boolean}
		 */
		this.modOnly = modOnly;

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
}
