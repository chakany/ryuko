import { Command, Inhibitor } from "discord-akairo";
import { Message } from "discord.js";

export default class DisabledInhibitor extends Inhibitor {
	constructor() {
		super("disabledInhibitor", {
			reason: "That command is disabled",
		});
	}

	exec(message: Message, command: Command) {
		if (this.client.isOwner(message.author.id)) return false;
		let disabledCommands = this.client.settings.get(
			message.guild!.id,
			"disabledCommands",
			null
		);

		if (!disabledCommands) return false;

		if (typeof disabledCommands === "string")
			disabledCommands = JSON.parse(disabledCommands);

		return disabledCommands.includes(command.id);
	}
}
