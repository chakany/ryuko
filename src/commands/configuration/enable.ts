import { Argument } from "discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class DisableCommand extends Command {
	constructor() {
		super("enable", {
			aliases: ["enable"],
			category: "Configuration",
			args: [
				{
					id: "toenable",
					type: Argument.union("commandAlias", "command", "string"),
				},
			],
			description: "Enable commands or categories",
			userPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		let toEnable = args.toenable;

		let oldSettings = this.client.settings.get(
			message.guild!.id,
			"disabledCommands",
			null
		);

		if (typeof oldSettings === "string")
			oldSettings = JSON.parse(oldSettings);

		if (!toEnable) {
			const embed = new MessageEmbed({
				title: "Commands",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			});

			let enabledCommands = "";
			for (const [key, dvalue] of new Map(
				message.util?.handler.categories!
			)) {
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

			return message.channel.send(embed);
		} else if (toEnable.category) {
			if (oldSettings && !oldSettings.includes(toEnable.id))
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Argument",
						"That command is already enabled!"
					)
				);
			let enabledCommands;

			if (!oldSettings) enabledCommands = [];
			else enabledCommands = oldSettings;

			enabledCommands = enabledCommands.filter(
				(command: any) => ![toEnable.id].includes(command)
			);

			this.client.settings.set(
				message.guild!.id,
				"disabledCommands",
				JSON.stringify(enabledCommands)
			);
			return message.channel.send(
				new MessageEmbed({
					title: `${this.client.emoji.greenCheck} Enabled command: \`${toEnable.aliases[0]}\``,
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				})
			);
		} else {
			// Try to resolve as a category
			if (message.util?.handler.findCategory(toEnable)) {
				const category = message.util?.handler.findCategory(toEnable);

				let enabledCommands = "";
				let commands: any;

				if (!oldSettings) commands = [];
				else commands = oldSettings;

				for (const [key, value] of new Map(category)) {
					if (oldSettings && oldSettings.includes(key)) {
						commands.push(key);
						enabledCommands =
							enabledCommands + "`" + value.aliases[0] + "` ";
					} else if (!oldSettings) {
						commands.push(key);
						enabledCommands =
							enabledCommands + "`" + value.aliases[0] + "` ";
					}
				}
				commands = oldSettings.filter(
					(command: any) => !commands.includes(command)
				);
				this.client.settings.set(
					message.guild!.id,
					"disabledCommands",
					JSON.stringify(commands)
				);
				const embed = new MessageEmbed({
					title: `${this.client.emoji.greenCheck} Enabled category: \`${category.id}\``,
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					fields: [{ name: "Enabled", value: enabledCommands }],
				});

				return message.channel.send(embed);
			} else {
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Argument",
						"You must provide a command or a category!"
					)
				);
			}
		}
	}
}
