import { Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../../utils/error";

export default class StopCommand extends Command {
	constructor() {
		super("stop", {
			aliases: ["stop"],
			description: "Stops the currently playing song",
			category: "Music",
			channel: "guild",
		});
	}

	async exec(message: Message): Promise<any> {
		try {
			// @ts-ignore
			const serverQueue = message.client.queue.get(message.guild.id);
			if (serverQueue === undefined)
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Usage",
						"There is no song currently playing"
					)
				);
			if (
				!message.member?.voice.channel ||
				message.member?.voice.channel !== serverQueue.voiceChannel
			)
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Usage",
						"You have to be in the voice channel to stop the music!"
					)
				);
			serverQueue.connection.disconnect();
			// @ts-ignore
			message.client.queue.delete(message.guild!.id);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
