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
		if (!serverQueue || !serverQueue.player)
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
						"You have to be in the same voice channel as me to stop the music!",
					),
				],
			});
		serverQueue.player.connection.disconnect();
		this.client.queue.delete(message.guild!.id);
	}
}
