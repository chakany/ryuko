import { Listener, Command } from "discord-akairo";
import { Message } from "discord.js";

import db from "../../utils/db";
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

		if (!message.author.bot) {
			const level = await db.addXp(message.author.id, 200, message);
			if (typeof level == "number") {
				const shouldLevelMessage = this.client.settings.get(
					message.guild!.id,
					"levelUpMessage",
					false
				);

				if (shouldLevelMessage) {
					message.channel.send(
						`Congrats ${message.author}, you leveled up to level ${level}!`
					);
				}
			}
		}
	}
}
