import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class MessageListener extends Listener {
	constructor() {
		super("message", {
			emitter: "client",
			event: "message",
		});
	}

	async exec(message: Message) {
		if (message.author.bot) return;

		if (
			message.channel.type == "dm" &&
			message.content.startsWith(this.client.config.prefix)
		)
			return message.channel.send(
				new MessageEmbed({
					title: "Invalid Channel",
					description: `Sorry, commands cannot be used in DMs! Please [add me to your server](${await this.client.generateInvite(
						{ permissions: "ADMINISTRATOR" }
					)} "Add me to your server!") to use my commands.`,
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					author: {
						name: `❌ Error`,
					},
				})
			);
		else if (message.channel.type == "dm") return;

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

		if (
			!this.client.settings.get(
				message.guild!.id,
				"someDumbFuckingSetting",
				null
			)
		)
			this.client.settings.set(
				message.guild!.id,
				"someDumbFuckingSetting",
				true
			);

		// Test against filter
		if (this.client.settings.get(message.guild!.id, "filter", false)) {
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
					message.delete({ reason: "Contains filtered word" });
					message.author.send(
						`Please do not use filtered words in **${
							message.guild!.name
						}**!`
					);
				}
			}
		}

		// Run XP
		const level = await this.client.db.addXp(
			message.author.id,
			message.guild!.id,
			10
		);

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
