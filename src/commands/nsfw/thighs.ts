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

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Thighs",
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
