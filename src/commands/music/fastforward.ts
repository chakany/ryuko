import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class FastforwardCommand extends Command {
	constructor() {
		super("fastforward", {
			aliases: ["fastforward", "ff"],
			description: "Fasts Forward in a song",
			category: "Music",
			channel: "guild",
			args: [
				{
					id: "seconds",
					type: "number",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		try {
			const serverQueue = this.client.queue.get(message.guild!.id);
			if (serverQueue === undefined)
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Usage",
						"There is no song currently playing"
					)
				);
			if (
				!message.member?.voice.channel ||
				message.member?.voice.channelID !==
					serverQueue.player?.voiceConnection.voiceChannelID
			)
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Usage",
						"You have to be in the voice channel to fast forward the music!"
					)
				);
			if (serverQueue.player.track!.length > args.seconds * 1000)
				serverQueue.player.stopTrack();

			serverQueue.player.seekTo(
				serverQueue.player.position + args.seconds * 1000
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