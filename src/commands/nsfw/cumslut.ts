import Command from "../../struct/Command";
import { Message } from "discord.js";
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

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Cumslut",
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
