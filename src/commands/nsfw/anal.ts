import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class AnalCommand extends Command {
	constructor() {
		super("anal", {
			aliases: ["anal"],
			description: "See Anal",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "analporn", true);

		return message.channel.send(
			new MessageEmbed({
				title: "Anal",
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
