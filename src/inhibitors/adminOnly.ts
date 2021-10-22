import Inhibitor from "../struct/Inhibitor";
import Command from "../struct/Command";
import { Message } from "discord.js";

export default class AdminInhibitor extends Inhibitor {
	constructor() {
		super("adminOnly", {
			reason: "Only Admins can use this command!",
		});
	}

	exec(message: Message, command: Command) {
		if (!command.adminOnly) return false;
		if (this.client.isOwner(message.author.id)) return false;
		const adminRole = this.client.settings.get(
			message.guild!.id,
			"adminRole",
			null,
		);

		if (
			adminRole &&
			!message.member!.roles.cache.some(
				(role) => role.id === adminRole,
			) &&
			message.channel
				// @ts-expect-error 2339
				.permissionsFor(message.author)
				.missing(command.userPermissions).length
		) {
			return true;
		}

		return false;
	}
}
