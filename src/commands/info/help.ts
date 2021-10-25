import { Argument, Category } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message } from "discord.js";
import ms from "ms";

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
						"string",
					),
				},
			],
		});
	}

	exec(message: Message, args: any) {
		const input = <Command | Category<string, Command> | string>(
			args["command|category"]
		);
		const prefix = message.util?.parsed?.prefix;
		const alias = message.util?.parsed?.alias;
		let disabledCommands = this.client.settings.get(
			message.guild!.id,
			"disabledCommands",
			null,
		);
		if (typeof disabledCommands === "string")
			disabledCommands = JSON.parse(disabledCommands);

		if (!input || typeof input == "string") {
			const embed = this.embed(
				{
					title: `${this.client.user!.username}'s Commands`,
					url: `${
						this.client.config.siteUrl
					}/commands#${this.handler.categories.firstKey()}-category`,
					description: `Run \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} <category>\` to see all commands in a category.\nRun \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} <command>\` to view information about a command.\n\nNeed help? Join my [Support Server](${this.client.config.supportInvite} "Join support server") or read my [Documentation](${this.client.config.siteUrl}/docs "Read Documentation")`,
				},
				message,
			);
			for (const [name, category] of this.handler.categories) {
				embed.addField(
					category.id,
					`\`${prefix}${alias} ${category.id.toLowerCase()}\`\n[Learn More](${
						this.client.config.siteUrl
					}/commands#${category.id}-category "See this Category")`,
					true,
				);
			}

			return message.channel.send({
				embeds: [embed],
			});
		} else if (input instanceof Command) {
			const embed = this.embed(
				{
					title: `${
						input.aliases[0].charAt(0).toUpperCase() +
						input.aliases[0].slice(1)
					} Command`,
					url: `${this.client.config.siteUrl}/commands/${input.categoryID}#${input.id}`,
					description: input.description,
				},
				message,
			);

			// Various fields to add depending if they exist or not
			embed.addField("Category", input.categoryID, true);
			if (input.aliases[1]) {
				const aliases = Array.from(input.aliases);
				aliases.shift();
				embed.addField("Aliases", aliases.join(", "), true);
			}
			if (
				input.userPermissions &&
				typeof input.userPermissions != "function"
			)
				embed.addField(
					"Required User Permissions",
					// @ts-expect-error This works i think
					input.userPermissions.join(", "),
					true,
				);
			if (input.clientPermissions)
				embed.addField(
					"Required Bot Permissions",
					// @ts-expect-error This works i think
					input.clientPermissions.join(", "),
					true,
				);
			if (input.nsfw) embed.addField("NSFW", "Yes", true);
			if (input.modOnly) embed.addField("Moderator Only", "Yes", true);
			if (input.ownerOnly) embed.addField("Owner Only", "Yes", true);
			if (input.cooldown)
				embed.addField(
					"Cooldown",
					ms(input.cooldown, { long: true }),
					true,
				);
			if (input.ratelimit != 1 && input.cooldown)
				embed.addField(
					"Ratelimit",
					`${input.ratelimit} uses per ${input.cooldown} ms`,
					true,
				);

			embed.addField("Usage", `\`${input.usage}\``);

			return message.channel.send({
				embeds: [embed],
			});
		} else if (input instanceof Category) {
			const embed = this.embed(
				{
					title: `${input.id} Category`,
					url: `${this.client.config.siteUrl}/commands#${input.id}-category`,
				},
				message,
			);
			let description = `Use \`${prefix}${alias} <command>\` to learn about a command\n\n`;

			for (const [name, command] of input) {
				description = description + `\`${command.aliases[0]}\` `;
			}

			embed.setDescription(description);

			return message.channel.send({
				embeds: [embed],
			});
		}
	}
}
