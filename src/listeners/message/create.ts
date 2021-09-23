import Listener from "../../struct/Listener";
import { Message, MessageEmbed } from "discord.js";

export default class MessageCreateListener extends Listener {
	constructor() {
		super("messageCreate", {
			emitter: "client",
			event: "messageCreate",
		});
	}

	async exec(message: Message) {
		if (message.author.bot) return;

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
						this.client.commandHandler.findCommand("prefix")
							.aliases[0]
					}` +
					"` command."
			);
		}

		if (message.partial) await message.fetch();
		this.client.commandHandler.handle(message);

		if (!this.client.settings.items.has(message.guild!.id))
			this.client.settings.set(
				message.guild!.id,
				"someDumbFuckingSetting",
				true
			);

		// Test against filter
		if (this.client.settings.get(message.guild!.id, "filter", false)) {
			if (
				this.client.settings.get(
					message.guild!.id,
					"filterBypass",
					false
				) &&
				(message.member!.roles.cache.has(
					this.client.settings.get(message.guild!.id, "modRole", null)
				) ||
					message.member!.roles.cache.has(
						this.client.settings.get(
							message.guild!.id,
							"adminRole",
							null
						)
					) ||
					message.member!.permissions.has("MANAGE_MESSAGES"))
			)
				return;

			const filteredPhrases = await this.client.db.getFilteredPhrases(
				message.guild!.id
			);

			const phrases = filteredPhrases.map((col: any) => col.phrase);

			if (phrases.length) {
				const regex = new RegExp(
					`^(.*?(${phrases.join("|")})[^$]*)$`,
					"gim"
				);

				if (regex.test(message.content)) {
					message.delete();
					message.author.send(
						`Please do not use filtered words in **${
							message.guild!.name
						}**!`
					);
				}
			}
		}
	}
}
