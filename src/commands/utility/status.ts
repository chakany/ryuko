import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

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
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must set a type of status!"
				)
			);

		if (!args.status)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must set a status!"
				)
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
				this.client.error(message, this, "An error occurred", error.message)
			);
		}

		return message.channel.send(
			new MessageEmbed({
				title: ":white_check_mark: Changed the bot's status successfully!",
				color: message.guild?.me?.displayHexColor,
				description:
					"Changed to `" +
					message.util!.parsed!.content!.replace(`${args.type} `, "") +
					"`.",
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
			})
		);
	}
}
