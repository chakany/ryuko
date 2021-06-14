import { Command } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";

export default class QueueCommand extends Command {
	constructor() {
		super("queue", {
			aliases: ["queue", "nowplaying"],
			description: "Gets the Song Queue",
			category: "Music",
		});
	}

	async exec(message: Message): Promise<any> {
		try {
			const serverQueue = this.client.queue.get(message.guild!.id);
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
				serverQueue.tracks[0].info.title +
				"`\n";
			let i;
			for (i = 1; i < 7; i++) {
				if (serverQueue.tracks[i] && serverQueue.tracks.length > 1) {
					let song = serverQueue.tracks[i];
					description =
						description +
						`\n**${i}:**` +
						" [`" +
						song.info.title +
						"`](" +
						song.info.uri +
						")";
				}
			}
			if (serverQueue.tracks.length > 6)
				description =
					description +
					`\nand **${serverQueue.tracks.length - 6}** more.`;
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
