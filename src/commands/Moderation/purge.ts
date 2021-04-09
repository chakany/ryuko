import { Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../../utils/error";

const args = [
	{
		id: "count",
		type: "number",
	},
	{
		id: "user",
		type: "member",
	},
];

export default class PurgeCommand extends Command {
	protected args = args;
	protected modOnly = true;

	constructor() {
		super("purge", {
			aliases: ["purge"],
			category: "Moderation",
			description: "Deletes user messages",
			clientPermissions: ["MANAGE_MESSAGES"],
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

	async exec(message: Message, args: any): Promise<any> {
		const victim = args.user;
		const count = args.count;

		if (!count)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You must provide how many messages to delete!"
				)
			);
		if (count > 100)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You cannot purge more than 100 message at once!"
				)
			);
		try {
			await message.channel.messages
				.fetch({ limit: count + 1 })
				.then((messages) => {
					let toDelete: any = messages;
					// Fetches the messages
					if (victim) {
						toDelete = [];
						messages
							.filter((m) => m.author.id === victim.id)
							.forEach((msg) => toDelete.push(msg));
					}
					// @ts-ignore
					message.channel.bulkDelete(
						toDelete // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
					);
				});
		} catch (error) {
			console.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
