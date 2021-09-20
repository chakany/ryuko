import { Inhibitor } from "@ryukobot/discord-akairo";
import Command from "../struct/Command";
import { Message } from "discord.js";

export default class ModInhibitor extends Inhibitor {
	constructor() {
		super("modOnly", {
			reason: "Only Moderators can use this command!",
		});
	}

	exec(message: Message, command: Command) {
		if (!command.modOnly && !command.adminOnly) return false;
		if (this.client.isOwner(message.author.id)) return false;
		const modRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			null
		);

		const adminRole = this.client.settings.get(
			message.guild!.id,
			"adminRole",
			null
		);

		if (
			((modRole && !message.member?.roles.cache.has(modRole)) ||
				(adminRole && !message.member?.roles.cache.has(adminRole))) &&
			message.channel
				// @ts-expect-error 2531
				.permissionsFor(message.author)
				.missing(command.userPermissions).length
		)
			return true;

		return false;
	}
}
