import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class ThighsCommand extends Command {
	constructor() {
		super("thighs", {
			aliases: ["thighs"],
			description: "See Thighs",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "thighs", true);

		return message.channel.send(
			new MessageEmbed({
				title: "Thighs",
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
