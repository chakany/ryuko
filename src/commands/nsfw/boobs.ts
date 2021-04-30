import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

export default class BoobCommand extends Command {
	constructor() {
		super("boobs", {
			aliases: ["boobs"],
			description: "Shows an image of some boobs",
			category: "NSFW",
			channel: "guild",
			nsfw: true,
		});
	}

	async exec(message: Message): Promise<any> {
		let image;
		try {
			image = await this.client.hentai.nsfw.boobs();
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				Error(
					message,
					this,
					"An error occurred",
					"There was an error retrieving the image."
				)
			);
		}

		return message.channel.send(
			new MessageEmbed({
				title: `Boobs`,
				color: 16716032,
				image: {
					url: image.url,
				},
				timestamp: new Date(),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: `Images from nekos.life\n${message.client.user!.tag}`,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
			})
		);
	}
}
