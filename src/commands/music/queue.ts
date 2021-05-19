import { Command } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";

export default class QueueCommand extends Command {
	constructor() {
		super("queue", {
			aliases: ["queue", "nowplaying"],
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
					this.client.error(
						message,
						this,
						"Invalid Usage",
						"There are no songs currently playing"
					)
				);
			let description =
				"**Currently Playing:** `" +
				serverQueue.songs[0].info.title +
				"`\n";
			let i;
			for (i = 1; i < 7; i++) {
				if (serverQueue.songs[i] && serverQueue.songs.length > 1) {
					let song = serverQueue.songs[i];
					description =
						description +
						`\n**${i}:**` +
						" `" +
						song.info.title +
						"`";
				}
			}
			if (serverQueue.songs.length > 6)
				description =
					description +
					`\nand **${serverQueue.songs.length - 6}** more.`;
			return message.channel.send(
				new MessageEmbed({
					title: "Song Queue",
					color: message.guild?.me?.displayHexColor,
					description: description,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				})
			);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An error occurred",
					error.message
				)
			);
		}
	}
}
