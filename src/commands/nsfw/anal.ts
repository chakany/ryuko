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

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Anal",
						image: {
							url: request.media,
						},
					},
					message
				),
			],
		});
	}
}
