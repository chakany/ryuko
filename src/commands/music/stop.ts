import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class StopCommand extends Command {
	constructor() {
		super("stop", {
			aliases: ["stop"],
			description: "Stops the currently playing song",
			category: "Music",
		});
	}

	async exec(message: Message): Promise<any> {
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
					"You have to be in the voice channel to stop the music!"
				)
			);
		serverQueue.player.disconnect();
		this.client.queue.delete(message.guild!.id);
	}
}
