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
		if (
			message.channel.type == "dm" &&
			message.content.startsWith(this.client.config.prefix) &&
			!message.author.bot
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

		if (!message.author.bot) {
			if (
				this.client.settings.get(
					message.guild!.id,
					"someDumbFuckingSetting",
					null
				) == null
			)
				this.client.settings.set(
					message.guild!.id,
					"someDumbFuckingSetting",
					true
				);

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
}
