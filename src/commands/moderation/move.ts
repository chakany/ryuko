import { Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../../utils/error";

const args = [
	{
		id: "user",
		type: "member",
	},
	{
		id: "channel",
		type: "voiceChannel",
	},
];

export default class MoveCommand extends Command {
	protected args = args;

	constructor() {
		super("move", {
			aliases: ["move"],
			category: "Moderation",
			description: "Move members into another voice channel",
			clientPermissions: ["MOVE_MEMBERS"],
			channel: "guild",
			args: args,
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

			message.member!.voice.setChannel(Channel);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
