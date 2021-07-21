import { Argument, Category } from "discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class HelpCommand extends Command {
	constructor() {
		super("help", {
			aliases: ["help", "commands"],
			category: "Info",
			description: "Shows a list of avaliable commands",
			args: [
				{
					id: "command|category",
					type: Argument.union(
						"commandAlias",
						"command",
						"category",
						"string"
					),
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const input = <Command | Category<string, Command> | string>(
			args["command|category"]
		);
		const prefix = message.util?.parsed?.prefix;
		const alias = message.util?.parsed?.alias;
		let disabledCommands = this.client.settings.get(
			message.guild!.id,
			"disabledCommands",
			null
		);
		if (typeof disabledCommands === "string")
			disabledCommands = JSON.parse(disabledCommands);

		if (!input || typeof input == "string") {
			const embed = new MessageEmbed({
				title: `${this.client.user!.username}'s Commands`,
				url: `${this.client.config.siteUrl}/commands`,
				description: `Run \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} <category>\` to see all commands in a category.\nRun \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} <command>\` to view information about a command.\n\nNeed help? Join my [Support Server](${this.client.config.supportInvite} "Join support server")`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			});
			for (const [name, category] of this.handler.categories) {
				embed.addField(
					category.id,
					`\`${prefix}${alias} ${category.id.toLowerCase()}\`\n[Learn More](${
						this.client.config.siteUrl
					}/commands/${category.id} "${
						this.client.config.siteUrl
					}/commands/${category.id}")`,
					true
				);
			}

			return message.channel.send(embed);
		} else if (input instanceof Command) {
			const embed = new MessageEmbed({
				title: `${
					input.aliases[0].charAt(0).toUpperCase() +
					input.aliases[0].slice(1)
				} Command`,
				url: `${this.client.config.siteUrl}/commands/${input.categoryID}/${input.id}`,
				description: input.description,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			});

			// Various fields to add depending if they exist or not
			embed.addField("Category", input.categoryID, true);
			if (input.aliases[1])
				embed.addField("Aliases", input.aliases, true);
			if (
				input.userPermissions &&
				typeof input.userPermissions != "function"
			)
				embed.addField(
					"Required User Permissions",
					input.userPermissions,
					true
				);
			if (input.clientPermissions)
				embed.addField(
					"Required Bot Permissions",
					input.clientPermissions,
					true
				);
			if (input.nsfw) embed.addField("NSFW", "Yes", true);
			if (input.modOnly) embed.addField("Moderator Only", "Yes", true);
			if (input.ownerOnly) embed.addField("Owner Only", "Yes", true);
			if (input.cooldown)
				embed.addField("Cooldown", `${input.cooldown} ms`, true);
			if (input.ratelimit != 1 && input.cooldown)
				embed.addField(
					"Ratelimit",
					`${input.ratelimit} uses per ${input.cooldown} ms`,
					true
				);

			embed.addField(
				"Usage",
				`\`${this.client.generateUsage(input, prefix)}\``
			);

			return message.channel.send(embed);
		} else if (input instanceof Category) {
			const embed = new MessageEmbed({
				title: `${input.id} Category`,
				url: `${this.client.config.siteUrl}/commands/${input.id}`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			});
			let description = `Use \`${prefix}${alias} <command>\` to learn about a command\n\n`;

			for (const [name, command] of input) {
				description = description + `\`${command.aliases[0]}\` `;
			}

			embed.setDescription(description);

			return message.channel.send(embed);
		}
	}
}
