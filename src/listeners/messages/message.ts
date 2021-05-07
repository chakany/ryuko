import { Listener, Command } from "discord-akairo";
import { Message } from "discord.js";

export default class MessageListener extends Listener {
	constructor() {
		super("message", {
			emitter: "client",
			event: "message",
		});
	}

	async exec(message: Message) {
		if (message.partial) await message.fetch();
		// @ts-expect-error
		this.client.commandHandler.handle(message);
	}
}
