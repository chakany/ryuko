import { Listener } from "discord-akairo";
import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class HandlerErrorListener extends Listener {
	constructor() {
		super("handlerError", {
			emitter: "commandHandler",
			event: "error",
		});
	}

	exec(error: Error, message: Message, command: Command) {
		return message.channel.send(
			this.client.error(
				message,
				command,
				"An Error Occurred",
				`\`\`\`${error}\`\`\``
			)
		);
	}
}
