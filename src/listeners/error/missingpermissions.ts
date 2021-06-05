import { Listener, Command } from "discord-akairo";
import { Message } from "discord.js";

export default class MissingPermissionsListener extends Listener {
	constructor() {
		super("missingPermissions", {
			emitter: "commandHandler",
			event: "missingPermissions",
		});
	}

	exec(message: Message, command: Command, type: string, missing: any) {
		return message.channel.send(
			this.client.error(
				message,
				command,
				"Missing Permissions",
				`${
					type == "client" ? "I do not have" : "You do not have"
				} the ${missing} permission(s)!${
					type == "client"
						? " Please check my permissions, and make the nessary changes."
						: ""
				}`
			)
		);
	}
}
