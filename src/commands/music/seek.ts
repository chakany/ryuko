import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class SeekCommand extends Command {
	constructor() {
		super("seek", {
			aliases: ["seek"],
			description: "Seeks to a position in the currently playing song",
			category: "Music",
			args: [
				{
					id: "position",
					type: "ms",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
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
					"You have to be in the voice channel to pause the music!"
				)
			);
		serverQueue.player.seekTo(args.position);
	}
}
