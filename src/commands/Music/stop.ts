import { Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../../utils/error";

export default class StopCommand extends Command {
	constructor() {
		super("stop", {
			aliases: ["stop"],
			description: "Stops the currently playing song",
			category: "Music",
		});
	}

	async exec(message: Message) {
		try {
			const serverQueue = message.client.queue.get(message.guild.id);
			if (
				!message.member.voice.channel ||
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
			if (!serverQueue)
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Usage",
						"There is no song currently playing"
					)
				);
			serverQueue.connection.disconnect();
			message.client.queue.delete(message.guild.id);
		} catch (error) {
			console.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
