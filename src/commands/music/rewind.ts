import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class RewindCommand extends Command {
	constructor() {
		super("rewind", {
			aliases: ["rewind", "rw"],
			description: "Rewind a song",
			category: "Music",

			args: [
				{
					id: "seconds",
					type: "number",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const serverQueue = this.client.queue.get(message.guild!.id);
		if (serverQueue === undefined)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"There is no song currently playing"
					),
				],
			});
		if (
			!message.member?.voice.channel ||
			message.member?.voice.channelId !==
				serverQueue.player?.voiceConnection.voiceChannelID
		)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"You have to be in the voice channel to rewind the music!"
					),
				],
			});
		if (serverQueue.player.position < args.seconds * 1000)
			serverQueue.player.seekTo(0);

		serverQueue.player.seekTo(
			serverQueue.player.position - args.seconds * 1000
		);
	}
}
