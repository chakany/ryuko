import { Inhibitor } from "@ryukobot/discord-akairo";
import Command from "../struct/Command";
import { Message, TextChannel } from "discord.js";

export default class NsfwInhibitor extends Inhibitor {
	constructor() {
		super("nsfw", {
			reason: "This command can only be used in NSFW Channels",
		});
	}

	exec(message: Message, command: Command) {
		if (
			!command.nsfw ||
			(command.nsfw && (<TextChannel>message.channel).nsfw)
		)
			return false;
		return true;
	}
}
