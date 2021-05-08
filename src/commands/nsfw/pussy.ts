import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class PussyCommand extends Command {
	constructor() {
		super("pussy", {
			aliases: ["pussy", "clit"],
			description: "Shows an image of some pussy",
			category: "NSFW",
			channel: "guild",
			nsfw: true,
		});
	}

	async exec(message: Message): Promise<any> {
		let image;
		try {
			image = await this.client.hentai.nsfw.pussy();
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An error occurred",
					"There was an error retrieving the image."
				)
			);
		}

		return message.channel.send(
			new MessageEmbed({
				title: `Pussy`,
				color: message.guild?.me?.displayHexColor,
				image: {
					url: image.url,
				},
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
			})
		);
	}
}
