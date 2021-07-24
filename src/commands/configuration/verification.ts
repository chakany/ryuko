import { Argument } from "discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed, Role } from "discord.js";

export default class VerificationCommand extends Command {
	constructor() {
		super("verification", {
			aliases: ["verification"],
			description: "Configure user verification",
			category: "Configuration",
			userPermissions: ["MANAGE_GUILD"],
			args: [
				{
					id: "action",
					type: "string",
				},
				{
					id: "value",
					type: Argument.union("role", "string"),
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		switch (args.action) {
			default:
				return message.channel.send(
					new MessageEmbed({
						title: "Verification Subcommands",
						description: `See more information on the [Verification Wiki](${this.client.config.siteUrl}/wiki/Features/Verification)`,
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
						fields: [
							{
								name: "`enable`",
								value: "Enable user verification, note that you must have a verified role set",
							},
							{
								name: "`disable`",
								value: "Disable user verification",
							},
							{
								name: "`level <value>`",
								value: "Set the level of verification you want\n`strict` Ban all alternate accounts\n`medium` Ban all alternate accounts that have an active punishment (like mute, or ban)\n`low` Take no action against alternate accounts, use this if you only want to present a CAPTCHA to users",
							},
							{
								name: "`role <role>`",
								value: "Set the role that verified users will be given after completing verification",
							},
						],
					})
				);
				break;
			case "enable":
				if (
					!this.client.settings.get(
						message.guild!.id,
						"verifiedRole",
						null
					)
				)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Configuration",
							`You must set a role to give to verified users! To do this, run \`${message.util?.parsed?.alias} role <value>\``
						)
					);

				this.client.settings.set(
					message.guild!.id,
					"verification",
					true
				);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.emoji.greenCheck} Enabled User Verification`,
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
						fields: [
							{
								name: "Level",
								value: this.client.settings.get(
									message.guild!.id,
									"verificationLevel",
									"low"
								),
							},
						],
					})
				);
				break;
			case "disable":
				this.client.settings.set(
					message.guild!.id,
					"verification",
					false
				);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.emoji.greenCheck} Disabled User Verification`,
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
				break;
			case "level":
				switch (args.value) {
					default:
						return message.channel.send(
							new MessageEmbed({
								title: "Verification Levels",
								color: message.guild?.me?.displayHexColor,
								timestamp: new Date(),
								footer: {
									text: message.author.tag,
									icon_url: message.author.displayAvatarURL({
										dynamic: true,
									}),
								},
								fields: [
									{
										name: "`strict`",
										value: "Ban all alternate accounts",
									},
									{
										name: "`medium`",
										value: "Ban all alternate accounts that have an active punishment (like mute, or ban)",
									},
									{
										name: "`low`",
										value: "Take no action against alternate accounts, use this if you only want to present a CAPTCHA to users",
									},
								],
							})
						);
						break;
					case "strict":
					case "medium":
					case "low":
						const oldLevel = this.client.settings.get(
							message.guild!.id,
							"verificationLevel",
							"low"
						);

						this.client.settings.set(
							message.guild!.id,
							"verificationLevel",
							args.value
						);

						return message.channel.send(
							new MessageEmbed({
								title: `${this.client.emoji.greenCheck} Set verification level`,
								color: message.guild?.me?.displayHexColor,
								timestamp: new Date(),
								footer: {
									text: message.author.tag,
									icon_url: message.author.displayAvatarURL({
										dynamic: true,
									}),
								},
								fields: [
									{
										name: "Before",
										value: oldLevel,
										inline: true,
									},
									{
										name: "After",
										value: args.value,
										inline: true,
									},
								],
							})
						);
				}
				break;
			case "role":
				if (!args.value)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Arguments",
							"You must provide a role to set!"
						)
					);

				const oldRole = this.client.settings.get(
					message.guild!.id,
					"verifiedRole",
					null
				);

				this.client.settings.set(
					message.guild!.id,
					"verifiedRole",
					(<Role>args.value).id
				);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.emoji.greenCheck} Set Verification Role`,
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
						fields: [
							{
								name: "Before",
								value: oldRole ? `<@&${oldRole}>` : "None",
								inline: true,
							},
							{
								name: "After",
								value: args.value,
								inline: true,
							},
						],
					})
				);
		}
	}
}
