import { Inhibitor, Command } from "discord-akairo";
import { Message } from "discord.js";

export default class ModInhibitor extends Inhibitor {
	constructor() {
		super("modOnly", {
			reason:
				"Only moderators with the moderation role can use this command\nIf there is no moderation role set, then set one with the 'modrole' command.",
		});
	}

	exec(message: Message, command: Command) {
		if (!command.modOnly) return false;
		if (this.client.isOwner(message.author.id)) return false;
		const modRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			null
		);

		if (
			!modRole ||
			(modRole &&
				!message.member!.roles.cache.some((role) => role.id === modRole))
		) {
			return true;
		}

		return false;
	}
}
