import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class PussyCommand extends Command {
	constructor() {
		super("pussy", {
			aliases: ["pussy", "clit"],
			description: "See Pussy",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "pussy", true);

		return message.channel.send(
			new MessageEmbed({
				title: "Pussy",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				image: {
					url: request.media,
				},
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
