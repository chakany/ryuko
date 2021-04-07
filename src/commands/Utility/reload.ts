import { Category, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

const arg = [
	{
		id: "command",
		type: "string",
	},
];

export default class DisableCommand extends Command {
	protected args = arg;

	constructor() {
		super("reload", {
			aliases: ["reload"],
			category: "Utility",
			args: arg,
			description: "Reloads bot commands",
			ownerOnly: true,
		});
	}

	async exec(message: Message, args: any) {
		try {
			const category: Category<any, any> = this.handler.findCategory(
				args.command
			);
			const command = this.handler.findCommand(args.command);

			if (category) {
				await category.reloadAll();
				return message.channel.send(
					new MessageEmbed({
						title:
							":white_check_mark: Reloaded Category: `" + category.id + "`",
						color: 16716032,
						description: "This category has been reloaded.",
						timestamp: new Date(),
						author: {
							name: message.author.tag,
							icon_url: message.author.avatarURL({ dynamic: true }),
						},
						footer: {
							text: message.client.user?.tag,
							icon_url: message.client.user?.avatarURL({
								dynamic: true,
							}),
						},
					})
				);
			} else if (command) {
				command.reload();
				return message.channel.send(
					new MessageEmbed({
						title: ":white_check_mark: Reloaded Command: `" + command.id + "`",
						color: 16716032,
						description: "This command has been reloaded.",
						timestamp: new Date(),
						author: {
							name: message.author.tag,
							icon_url: message.author.avatarURL({ dynamic: true }),
						},
						footer: {
							text: message.client.user?.tag,
							icon_url: message.client.user?.avatarURL({
								dynamic: true,
							}),
						},
					})
				);
			} else
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Argument",
						"You must provide a command/category to reload!"
					)
				);
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
