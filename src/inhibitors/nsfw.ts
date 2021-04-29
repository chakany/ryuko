import { Inhibitor, Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../utils/error";

export default class NsfwInhibitor extends Inhibitor {
	constructor() {
		super("nsfw", {
			reason: "Command is marked as NSFW",
		});
	}

	exec(message: Message, command: Command) {
		if (!command.nsfw) return false;
		// @ts-ignore
		else if (command.nsfw && message.channel.nsfw) return false;
		else
			message.channel.send(
				Error(
					message,
					command,
					"Invalid Usage",
					"This command can only be used in NSFW Channels!"
				)
			);
		return true;
	}
}
