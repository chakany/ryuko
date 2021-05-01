import { Inhibitor, Command } from "discord-akairo";
import { Message } from "discord.js";

export default class GuildInhibitor extends Inhibitor {
	constructor() {
		super("guild", {
			reason: "This command is restricted to select guilds",
		});
	}

	exec(message: Message, command: Command) {
		if (command.guild.length == 0) return false;
		return !command.guild.includes(message.guild!.id);
	}
}
