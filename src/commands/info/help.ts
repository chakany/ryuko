import { Command, Argument } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

export default class HelpCommand extends Command {
	constructor() {
		super("help", {
			aliases: ["help", "commands"],
			category: "Info",
			description: "Shows a list of avaliable commands",
			args: [
				{
					id: "command",
					type: Argument.union("commandAlias", "string"),
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const prefix = message.util?.parsed?.prefix;
		const helpCommand = message.util?.parsed?.alias;
		let disabledCommands = this.client.settings.get(
			message.guild!.id,
			"disabledCommands",
			null
		);
		if (typeof disabledCommands === "string")
			disabledCommands = JSON.parse(disabledCommands);
		if (!args.command) {
			// If there are no command arguments, this will show all commands that are accessible to the user based on their permissions, roles, and owner status.
			const helpEmbed = new MessageEmbed({
				title: `${message.client.user!.username}'s Commands`,
				description:
					"**Prefix**: `" +
					prefix +
					"`\n**View All Commands**: `" +
					`${prefix}${helpCommand} all` +
					"`\n**View Command Info**: `" +
					`${prefix}${helpCommand} <${this.args[0].id}>` +
					"`",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: `Only showing avaliable commands\n${message.author.tag}`,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
			});
			const modRole = this.client.settings.get(
				message.guild!.id,
				"modRole",
				"None"
			);
			for (const [key, dvalue] of new Map(message.util?.handler.categories!)) {
				// For each category
				let commands = "";
				for (const [key2, fvalue] of new Map(dvalue)) {
					// For each command in that category
					// Check if the user has the permissions to use that command
					if (
						(fvalue.ownerOnly && !this.client.isOwner(message.author)) ||
						(fvalue.modOnly &&
							!message.member!.roles.cache.some(
								(role) => role.id === modRole
							)) ||
						(!fvalue.guild.includes(message.guild!.id) &&
							fvalue.guild.length != 0) ||
						(disabledCommands && disabledCommands.includes(key2))
					) {
						// The user does not have the permissions to use this command, do not display it.
					} else {
						// The user does have the permission to use it, add it to the commands variable.
						commands = commands + " `" + fvalue.aliases[0] + "`";
					}
				}
				// If the commands variable has any value, add it to the embed
				if (commands) helpEmbed.addField(key, commands);
			}
			return message.channel.send(helpEmbed);
		} else if (args.command === "all") {
			// If our command argument is all, this gets a list of ALL commands regardless of permission
			const helpEmbed = new MessageEmbed({
				title: `${message.client.user!.username}'s Commands`,
				description:
					"**Prefix**: `" +
					prefix +
					"`\n**View Command Info**: `" +
					`${prefix}${helpCommand} <${this.args[0].id}>` +
					"`",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				author: {
					name: message.author.tag,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				footer: {
					text: `Showing all commands\n${message.author.tag}`,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
			});
			for (const [key, dvalue] of new Map(message.util?.handler.categories!)) {
				// For each category
				let commands = "";
				for (const [key2, fvalue] of new Map(dvalue)) {
					// For each command in that category
					// Add it to the variable commands
					commands = commands + " `" + fvalue.aliases[0] + "`";
				}
				// Add it to the embed
				helpEmbed.addField(key, commands);
			}
			return message.channel.send(helpEmbed);
		} else if (args.command.id) {
			const command = args.command;
			let usage: string = `${prefix}${command.id}`;

			const helpEmbed = new MessageEmbed({
				title: "Command: `" + command.id + "`",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
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
				helpEmbed.addField("Aliases", command.aliases.splice(1));
			if (command.ownerOnly) helpEmbed.addField("Owner Only", "Yes");
			if (disabledCommands && disabledCommands.includes(command.id))
				helpEmbed.addField("Disabled", "Yes");
			if (command.args) {
				let current;
				for (let i = 0; (current = command.args[i]); i++) {
					usage = usage + ` <${current.id}>`;
				}
			}
			helpEmbed.addField("Usage", "`" + usage + "`");
			return message.channel.send(helpEmbed);
		} else if (message.util?.handler.categories.get(args.command)) {
			// If our command argument is all, this gets a list of ALL commands regardless of permission
			const helpEmbed = new MessageEmbed({
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
			});
			let commands = "";
			const category = message.util?.handler.categories.get(args.command)!;
			for (const [key2, fvalue] of new Map(category)) {
				// For each command in that category
				// Add it to the variable commands
				commands = commands + " `" + fvalue.aliases[0] + "`";
			}
			// Add it to the embed
			helpEmbed.setTitle("Category: `" + category.id + "`");
			helpEmbed.setDescription(commands);
			return message.channel.send(helpEmbed);
		} else {
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					`You must provide a valid command, use ${prefix}${helpCommand} on it's own, or use ${prefix}${helpCommand} all.`
				)
			);
		}
	}
}
