import { Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../../utils/error";

export default class MoveCommand extends Command {
	constructor() {
		super("move", {
			aliases: ["move"],
			category: "Moderation",
			description: "Move members into another voice channel",
			clientPermissions: ["MOVE_MEMBERS"],
			channel: "guild",
			args: [
				{
					id: "user",
					type: "member",
				},
				{
					id: "channel",
					type: "voiceChannel",
				},
			],
			modOnly: true,
		});
	}

	exec(message: Message, args: any): any {
		try {
			const victim = args.user;
			const Channel = args.channel;

			// Check if the member is provided
			if (!victim)
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Argument",
						"You must provide a user to move!"
					)
				);

			// Check if the channel is valid
			if (!Channel)
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Argument",
						"You must provide a voice channel to move to!"
					)
				);

			victim.voice.setChannel(Channel);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
