import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class StatusCommand extends Command {
	constructor() {
		super("status", {
			aliases: ["status"],
			description: "Change my status",
			category: "Owner",
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
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must set a type of status!",
					),
				],
			});

		if (!args.status)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must set a status!",
					),
				],
			});

		// Run the actual command
		const content = message.util!.parsed!.content!.replace(
			`${args.type} `,
			"",
		);
		this.client.shard!.broadcastEval((client) => {
			client.user?.setActivity(content, {
				type: args.type.toUpperCase(),
			});
		});

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${this.client.emoji.greenCheck} Changed the bot's status successfully!`,
						description:
							"Changed to `" +
							message.util!.parsed!.content!.replace(
								`${args.type} `,
								"",
							) +
							"`.",
					},
					message,
				),
			],
		});
	}
}
