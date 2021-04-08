import { Command } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";

import Error from "../../utils/error";

export default class QueueCommand extends Command {
	constructor() {
		super("queue", {
			aliases: ["queue"],
			description: "Gets the Song Queue",
			category: "Music",
			channel: "guild",
		});
	}

	async exec(message: Message): Promise<any> {
		try {
			// @ts-ignore
			const serverQueue = message.client.queue.get(message.guild!.id);
			if (!serverQueue)
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Usage",
						"There are no songs currently playing"
					)
				);
			let description =
				"**Currently Playing:** `" + serverQueue.songs[0].info.title + "`\n";
			let song;
			for (let i = 1; (song = serverQueue.songs[i]); i++) {
				description =
					description + `\n**${i}:**` + " `" + song.info.title + "`";
			}
			return message.channel.send(
				new MessageEmbed({
					title: "Song Queue",
					color: 16716032,
					description: description,
					timestamp: new Date(),
					author: {
						name: message.author.tag,
						icon_url: message.author.avatarURL({ dynamic: true }) || "",
					},
					footer: {
						text: message.client.user?.tag,
						icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
					},
				})
			);
		} catch (error) {
			console.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
