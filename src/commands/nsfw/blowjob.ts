import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class BlowjobCommand extends Command {
	constructor() {
		super("blowjob", {
			aliases: ["blowjob"],
			description: "See Blowjob",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "blowjobs", true);

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Blowjob",
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
