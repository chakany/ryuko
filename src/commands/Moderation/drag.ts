import { Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../../utils/error";

const args = [
	{
		id: "user",
		type: "memberMention",
	},
];

export default class DragCommand extends Command {
	protected args = args;

	constructor() {
		super("drag", {
			aliases: ["drag", "move"],
			category: "Moderation",
			description: "Drag other members into your own channel",
			clientPermissions: ["MOVE_MEMBERS"],
			args: args,
		});
	}

	userPermissions(message: Message) {
		if (
			!message.member!.roles.cache.some((role) => role.name === "Discord Mod")
		) {
			return "Discord Mod";
		}

		return null;
	}

	exec(message: Message, args: any) {
		const victim = args.user;

		// Get the mentioned user
		const Channel = message.member!.voice.channel;
		// Check if the user is valid
		if (!victim)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You must provide a user to drag!"
				)
			);

		// Check if the channel is valid
		if (!Channel)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Usage",
					"You must be inside a voice channel!"
				)
			);

		victim.voice.setChannel(Channel).catch((error: any) => {
			return message.channel.send(
				Error(message, this, "An Error Occured!", error.message)
			);
		});
	}
}
