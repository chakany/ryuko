import Command from "../../struct/Command";
import { Message } from "discord.js";
import { get } from "reddit-grabber";

export default class BoobsCommand extends Command {
	constructor() {
		super("boobs", {
			aliases: ["boobs"],
			description: "See Boobs",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "boobs", true);

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Boobs",
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
