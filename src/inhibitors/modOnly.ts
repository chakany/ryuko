import { Inhibitor, Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../utils/error";

export default class ModInhibitor extends Inhibitor {
	constructor() {
		super("modOnly", {
			reason: "Insufficent Permissions",
		});
	}

	exec(message: Message, command: Command) {
		if (!command.modOnly) return false;
		const modRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			null
		);
		if (
			modRole &&
			!message.member!.roles.cache.some((role) => role.id === modRole)
		) {
			message.channel.send(
				Error(
					message,
					command,
					"Insufficent Permissions",
					"You must be a discord mod to use this command."
				)
			);

			return true;
		} else if (!modRole) {
			message.channel.send(
				Error(
					message,
					command,
					"Invalid Configuration",
					"To use mod commands, you must first set a mod role. See the configuration section in help for more info."
				)
			);

			return true;
		}

		return false;
	}
}
