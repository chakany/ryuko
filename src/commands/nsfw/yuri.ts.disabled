import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class YuriCommand extends Command {
	constructor() {
		super("yuri", {
			aliases: ["yuri"],
			description: "See Yuri Hentai",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "yuri", true);

		return message.channel.send(
			new MessageEmbed({
				title: "Yuri",
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
