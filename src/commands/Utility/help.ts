import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

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
			description: "Shows a list of avaliable commands",
			args: arg,
		});
	}

	async exec(message: Message, args: any) {
		const prefix = message.util?.parsed?.prefix;

		if (!args.command) {
			const helpCommand = message.util?.parsed?.alias;
			const helpEmbed = new MessageEmbed({
				title: `${message.client.user!.username}'s Commands`,
				description:
					"**Prefix**: `" +
					prefix +
					"`\n**View Command Info**: `" +
					`${prefix}${helpCommand} <${arg[0].id}>` +
					"`",
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: `Only showing avaliable commands\n${message.client.user?.tag}`,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
			});
			for (const [key, dvalue] of new Map(message.util?.handler.categories!)) {
				let commands = "";
				let disabledCommands;
				for (const [key2, fvalue] of new Map(dvalue)) {
					let current;
					if (fvalue.ownerOnly && !this.client.isOwner(message.author)) {
					} else {
						for (let i = 0; (current = fvalue.aliases[i]); i++) {
							commands = commands + " `" + current + "`";
						}
					}
				}
				if (commands) helpEmbed.addField(key, commands);
			}
			return message.channel.send(helpEmbed);
		} else {
			const command = args.command;
			let usage: string = `${prefix}${command.id}`;

			const helpEmbed = new MessageEmbed({
				title: "Command: `" + command.id + "`",
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: message.client.user?.tag,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
			});

			if (command.description !== "")
				helpEmbed.setDescription(command.description);
			if (command.cooldown) helpEmbed.addField("Cooldown", command.cooldown);
			if (command.clientPermissions)
				helpEmbed.addField(
					"Required Bot Permissions",
					command.clientPermissions
				);
			if (
				command.userPermissions &&
				typeof command.userPermissions !== "function"
			)
				helpEmbed.addField(
					"Required User Permissions",
					command.userPermissions
				);
			if (command.aliases.length > 1)
				helpEmbed.addField("Aliases", command.aliases);
			if (command.ownerOnly) helpEmbed.addField("Owner Only", "True");
			if (command.args) {
				let current;
				for (let i = 0; (current = command.args[i]); i++) {
					usage = usage + ` <${current.id}>`;
				}
			}
			helpEmbed.addField("Usage", "`" + usage + "`");
			return message.channel.send(helpEmbed);
		}
	}
}
