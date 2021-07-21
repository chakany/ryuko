import { Inhibitor } from "discord-akairo";
import Command from "../struct/Command";
import { Message } from "discord.js";

export default class ModInhibitor extends Inhibitor {
	constructor() {
		super("modOnly", {
			reason: "Only moderators can use this command!",
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
				!message.member!.roles.cache.some(
					(role) => role.id === modRole
				) &&
				message.channel
					// @ts-expect-error 2339
					.permissionsFor(message.author)
					.missing(command.userPermissions).length)
		) {
			return true;
		}

		return false;
	}
}
