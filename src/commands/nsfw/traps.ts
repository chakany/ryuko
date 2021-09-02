import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class TrapsCommand extends Command {
	constructor() {
		super("traps", {
			aliases: ["traps", "trap"],
			description: "See Traps",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "traps", true);

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Trap",
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
