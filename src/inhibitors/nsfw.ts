import { Inhibitor, Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../utils/error";

export default class NsfwInhibitor extends Inhibitor {
	constructor() {
		super("nsfw", {
			reason: "This command can only be used in NSFW Channels",
		});
	}

	exec(message: Message, command: Command) {
		// @ts-ignore
		if (!command.nsfw || (command.nsfw && message.channel.nsfw)) return false;
		return true;
	}
}
