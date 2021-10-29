import Command from "../../struct/Command";
import { Message } from "discord.js";
import { get } from "reddit-grabber";

export default class LesbianCommand extends Command {
	constructor() {
		super("lesbian", {
			aliases: ["lesbian"],
			description: "See Lesbian",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "lesbians", true);

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Lesbian",
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
