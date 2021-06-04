import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class SupportCommand extends Command {
	constructor() {
		super("support", {
			aliases: ["support"],
			description: "Provides a link to the Support Server.",
			category: "Info",
		});
	}

	async exec(message: Message) {
		return message.channel.send(
			new MessageEmbed({
				title: "Support",
				description: `Need help? [Join my Support Server](${this.client.config.supportUrl} "${this.client.config.supportUrl}")`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			})
		);
	}
}
