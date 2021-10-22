import Listener from "../../struct/Listener";
import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class CommandBlockedListener extends Listener {
	constructor() {
		super("commandBlocked", {
			emitter: "commandHandler",
			event: "commandBlocked",
		});
	}

	exec(message: Message, command: Command, reason: string) {
		return message.channel.send({
			embeds: [command.error(message, "Command Blocked", reason)],
		});
	}
}
