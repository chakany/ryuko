import Listener from "../../struct/Listener";
import Command from "../../struct/Command";
import { Message } from "discord.js";
import ms from "ms";

export default class CooldownListener extends Listener {
	constructor() {
		super("cooldown", {
			emitter: "commandHandler",
			event: "cooldown",
		});
	}

	exec(message: Message, command: Command, remaining: number) {
		return message.channel.send({
			embeds: [
				command.error(
					message,
					"Command Blocked",
					`You are currently on a cooldown for this command, you will be able to use it again in **${ms(
						remaining,
						{ long: true }
					)}**.`
				),
			],
		});
	}
}
