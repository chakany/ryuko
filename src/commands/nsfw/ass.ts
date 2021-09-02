import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class AssCommand extends Command {
	constructor() {
		super("ass", {
			aliases: ["ass"],
			description: "See Ass",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "ass", true);

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Ass",
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
