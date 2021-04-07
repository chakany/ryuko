import { Category, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

const arg = [
	{
		id: "command",
		type: "commandAlias",
	},
];

export default class HelpCommand extends Command {
	protected args = arg;

	constructor() {
		super("help", {
			aliases: ["help", "commands"],
			category: "Utility",
			args: arg,
		});
	}

	exec(message: Message, args: any) {
		if (!args.command) {
			const prefix = message.util?.parsed?.prefix;
			const helpCommand = message.util?.parsed?.alias;
			const helpEmbed = new MessageEmbed({
				title: `${message.client.user!.username}'s Commands`,
				description:
					"**Prefix**: `" +
					prefix +
					"`\n**All Commands**: `" +
					`${prefix}${helpCommand} all` +
					"`\n**View Command Info**: `" +
					`${prefix}${helpCommand} <${arg[0].id}>` +
					"`",
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }),
				},
				footer: {
					text: `Only showing avaliable commands\n${message.client.user?.tag}`,
					icon_url: message.client.user?.avatarURL({ dynamic: true }),
				},
			});

			for (const [key, dvalue] of new Map(message.util?.handler.categories!)) {
				let commands = "";
				for (const [key, fvalue] of new Map(dvalue)) {
					let current;
					for (let i = 0; (current = fvalue.aliases[i]); i++) {
						commands = commands + " `" + current + "`";
					}
				}
				if (commands) helpEmbed.addField(key, commands);
			}

			return message.channel.send(helpEmbed);
		}
	}
}
