import Listener from "../../struct/Listener";
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
		return message.channel.send({
			embeds: [
				command.error(
					message,
					"An Error Occurred",
					`\`\`\`${error}\`\`\``,
				),
			],
		});
	}
}
