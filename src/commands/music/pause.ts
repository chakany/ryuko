import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class PauseCommand extends Command {
	constructor() {
		super("pause", {
			aliases: ["pause"],
			description: "Pauses the currently playing song",
			category: "Music",
		});
	}

	async exec(message: Message): Promise<any> {
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
						"You have to be in the voice channel to pause the music!"
					),
				],
			});
		serverQueue.player.setPaused(true);
		serverQueue.paused = true;
	}
}
