import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

export default class StatusCommand extends Command {
	constructor() {
		super("status", {
			aliases: ["status"],
			description: "Change bot status",
			category: "Utility",
			ownerOnly: true,
			args: [
				{
					id: "type",
					type: "string",
				},
				{
					id: "status",
					type: "string",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		// Check for args
		if (!args.type)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You must set a type of status!"
				)
			);

		if (!args.status)
			return message.channel.send(
				Error(message, this, "Invalid Argument", "You must set a status!")
			);

		// Run the actual command
		const content = message.util!.parsed!.content!.replace(`${args.type} `, "");
		try {
			this.client.shard!.broadcastEval(
				`this.user.setActivity('${content}', { type: '${args.type.toUpperCase()}' })`
			);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}

		return message.channel.send(
			new MessageEmbed({
				title: ":white_check_mark: Changed the bot's status successfully!",
				color: 16716032,
				description:
					"Changed to `" +
					message.util!.parsed!.content!.replace(`${args.type} `, "") +
					"`.",
				timestamp: new Date(),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: message.client.user?.tag,
					icon_url:
						message.client.user?.avatarURL({
							dynamic: true,
						}) || "",
				},
			})
		);
	}
}
