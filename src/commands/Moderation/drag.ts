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
	protected modOnly = true;

	constructor() {
		super("drag", {
			aliases: ["drag", "move"],
			category: "Moderation",
			description: "Drag other members into your own channel",
			clientPermissions: ["MOVE_MEMBERS"],
			channel: "guild",
			args: args,
		});
	}

	// @ts-ignore stupid issue over types and shit
	userPermissions(message: Message) {
		const modRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			null
		);
		if (
			modRole &&
			!message.member!.roles.cache.some((role) => role.id === modRole)
		) {
			return "roleId: " + modRole;
		} else if (!modRole) {
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Configuration",
					"To use mod commands, you must first set a mod role. See the configuration section in help for more info."
				)
			);
		}

		return null;
	}

	exec(message: Message, args: any): any {
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
