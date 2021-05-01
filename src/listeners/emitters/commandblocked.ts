import { Listener, Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../../utils/error";

export default class CommandBlockedListener extends Listener {
	constructor() {
		super("commandBlocked", {
			emitter: "commandHandler",
			event: "commandBlocked",
		});
	}

	exec(message: Message, command: Command, reason: string) {
		return message.channel.send(
			Error(message, command, "Command Blocked", reason)
		);
	}
}
