import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class SkipCommand extends Command {
	constructor() {
		super("skip", {
			aliases: ["skip", "s"],
			description: "Skips the currently playing song",
			category: "Music",

			args: [
				{
					id: "track",
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
						"You have to be in the voice channel to skip the music!"
					)
				);
			if (args.track > 1) {
				serverQueue.tracks.splice(0, args.track - 1);
			} else if (serverQueue.loop) {
				serverQueue.tracks.shift();
			}
			serverQueue.player.stopTrack();
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
