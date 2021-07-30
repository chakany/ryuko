import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class CumslutCommand extends Command {
	constructor() {
		super("cumslut", {
			aliases: ["cumslut"],
			description: "See Cumsluts",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "cumsluts", true);

		return message.channel.send(
			new MessageEmbed({
				title: "Cumslut",
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
