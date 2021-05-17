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
		if (
			message.content === `<@${this.client.user!.id}>` ||
			message.content === `<@!${this.client.user!.id}>`
		) {
			const prefix = this.client.settings.get(
				message.guild!.id,
				"prefix",
				this.client.config.prefix
			);

			return message.channel.send(
				"***psst***, my prefix is `" +
					prefix +
					"`. To change it, use the `" +
					`${prefix}${
						this.client.commandHandler.findCommand("prefix").aliases[0]
					}` +
					"` command."
			);
		}
		if (!message.author.bot) {
			const level = await this.client.db.addXp(message.author.id, 10, message);
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

		if (message.partial) await message.fetch();
		this.client.commandHandler.handle(message);
	}
}
