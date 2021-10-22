import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class DisableCommand extends Command {
	constructor() {
		super("disable", {
			aliases: ["disable"],
			category: "Configuration",
			args: [
				{
					id: "todisable",
					type: Argument.union("commandAlias", "command", "string"),
				},
			],
			description: "Disable commands or categories",
			userPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const toDisable = args.todisable;

		let oldSettings = this.client.settings.get(
			message.guild!.id,
			"disabledCommands",
			null,
		);

		if (typeof oldSettings === "string")
			oldSettings = JSON.parse(oldSettings);

		if (!toDisable) {
			const embed = this.embed(
				{
					title: "Commands",
				},
				message,
			);

			let enabledCommands = "";
			for (const [key, dvalue] of new Map(this.handler.categories)) {
				// For each category
				for (const [key2, fvalue] of new Map(dvalue)) {
					// For each command in that category
					// Add it to the variable commands
					if (!oldSettings || !oldSettings.includes(fvalue.id))
						enabledCommands =
							enabledCommands + " `" + fvalue.aliases[0] + "`";
				}
			}
			embed.addField("Enabled", enabledCommands);
			if (oldSettings && oldSettings[0] !== undefined) {
				let disabledCommands = "";

				let current;
				for (let i = 0; (current = oldSettings[i]); i++) {
					const command = this.handler.findCommand(current);
					disabledCommands =
						disabledCommands + "`" + command.aliases[0] + "` ";
				}
				embed.addField("Disabled", disabledCommands);
			}

			return message.channel.send({ embeds: [embed] });
		} else if (toDisable.category) {
			if (oldSettings && oldSettings.includes(toDisable.id))
				return message.channel.send({
					embeds: [
						this.error(
							message,
							"Invalid Argument",
							"That command is already disabled!",
						),
					],
				});
			let disabledCommands;

			if (!oldSettings) disabledCommands = [];
			else disabledCommands = oldSettings;

			disabledCommands.push(toDisable.id);

			this.client.settings.set(
				message.guild!.id,
				"disabledCommands",
				JSON.stringify(disabledCommands),
			);
			return message.channel.send({
				embeds: [
					this.embed(
						{
							title: `${this.client.emoji.greenCheck} Disabled command: \`${toDisable.aliases[0]}\``,
						},
						message,
					),
				],
			});
		} else {
			// Try to resolve as a category
			if (message.util?.handler.findCategory(toDisable)) {
				const category = message.util?.handler.findCategory(toDisable);

				let disabledCommands = "";
				let commands;

				if (!oldSettings) commands = [];
				else commands = oldSettings;

				for (const [key, value] of new Map(category)) {
					if (oldSettings && !oldSettings.includes(key)) {
						commands.push(key);
						disabledCommands =
							disabledCommands + "`" + value.aliases[0] + "` ";
					} else if (!oldSettings) {
						commands.push(key);
						disabledCommands =
							disabledCommands + "`" + value.aliases[0] + "` ";
					}
				}
				this.client.settings.set(
					message.guild!.id,
					"disabledCommands",
					JSON.stringify(commands),
				);
				const embed = this.embed(
					{
						title: `${this.client.emoji.greenCheck} Disabled category: \`${category.id}\``,
						fields: [{ name: "Disabled", value: disabledCommands }],
					},
					message,
				);

				return message.channel.send({ embeds: [embed] });
			} else {
				return message.channel.send({
					embeds: [
						this.error(
							message,
							"Invalid Argument",
							"You must provide a command or a category!",
						),
					],
				});
			}
		}
	}
}
