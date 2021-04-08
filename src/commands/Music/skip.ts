import { Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../../utils/error";

export default class SkipCommand extends Command {
	constructor() {
		super("skip", {
			aliases: ["skip"],
			description: "Skips the currently playing song",
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
						"You have to be in the voice channel to skip the music!"
					)
				);
			serverQueue.connection.stopTrack();
		} catch (error) {
			console.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
