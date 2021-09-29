import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class BdsmCommand extends Command {
	constructor() {
		super("bdsm", {
			aliases: ["bdsm"],
			description: "See BDSM",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "bdsm", true);

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "BDSM",
						image: {
							url: request.media,
						},
					},
					message,
				),
			],
		});
	}
}
