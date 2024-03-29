import Command from "../../struct/Command";
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
		const serverQueue = this.client.queue.get(message.guild!.id);
		if (serverQueue === undefined)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"There is no song currently playing",
					),
				],
			});
		if (
			!message.member?.voice.channel ||
			message.member?.voice.channelId !==
				serverQueue.player?.connection.channelId
		)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"You have to be in the voice channel to skip the music!",
					),
				],
			});
		if (args.track > 1) {
			serverQueue.tracks.splice(0, args.track - 1);
		} else if (serverQueue.loop) {
			serverQueue.tracks.shift();
		}
		serverQueue.player.stopTrack();
	}
}
