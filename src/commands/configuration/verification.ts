import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed, Role } from "discord.js";
import { roleMention } from "@discordjs/builders";

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
		const enabled = this.client.settings.get(
			message.guild!.id,
			"verification",
			false
		);

		const level = this.client.settings.get(
			message.guild!.id,
			"verificationLevel",
			"low"
		);

		switch (args.action) {
			default:
				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${
									enabled
										? this.client.emoji.greenCheck
										: this.client.emoji.redX
								} Verification Subcommands`,
								description: `See more information on the [Verification Wiki](${this.client.config.siteUrl}/wiki/Features/Verification)`,
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
										value: `Set the level of verification you want\n${
											level == "strict"
												? this.client.emoji.greenCheck +
												  " "
												: ""
										}\`strict\` Ban all alternate accounts\n${
											level == "medium"
												? this.client.emoji.greenCheck +
												  " "
												: ""
										}\`medium\` Ban all alternate accounts that have an active punishment (like mute, or ban)\n
										${
											level == "low"
												? this.client.emoji.greenCheck +
												  " "
												: ""
										}\`low\` Take no action against alternate accounts, use this if you only want to present a CAPTCHA to keep out bots.`,
									},
									{
										name: `\`role <role>\``,
										value: `**Current Role:** ${
											this.client.settings.get(
												message.guild!.id,
												"verifiedRole",
												null
											)
												? `${roleMention(
														this.client.settings.get(
															message.guild!.id,
															"verifiedRole",
															null
														)
												  )}`
												: "None"
										}\nSet the role that verified users will be given after completing verification`,
									},
								],
							},
							message
						),
					],
				});
				break;
			case "enable":
				if (
					!this.client.settings.get(
						message.guild!.id,
						"verifiedRole",
						null
					)
				)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Configuration",
								`You must set a role to give to verified users! To do this, run \`${message.util?.parsed?.alias} role <value>\``
							),
						],
					});

				this.client.settings.set(
					message.guild!.id,
					"verification",
					true
				);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Enabled User Verification`,
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
							},
							message
						),
					],
				});
				break;
			case "disable":
				this.client.settings.set(
					message.guild!.id,
					"verification",
					false
				);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Disabled User Verification`,
							},
							message
						),
					],
				});
				break;
			case "level":
				switch (args.value) {
					default:
						return message.channel.send({
							embeds: [
								this.embed(
									{
										title: "Verification Levels",
										fields: [
											{
												name: `${
													level == "strict"
														? this.client.emoji
																.greenCheck +
														  " "
														: ""
												}\`strict\``,
												value: "Ban all alternate accounts",
											},
											{
												name: `${
													level == "medium"
														? this.client.emoji
																.greenCheck +
														  " "
														: ""
												}\`medium\``,
												value: "Ban all alternate accounts that have an active punishment (like mute, or ban)",
											},
											{
												name: `${
													level == "low"
														? this.client.emoji
																.greenCheck +
														  " "
														: ""
												}\`low\``,
												value: "Take no action against alternate accounts, use this if you only want to present a CAPTCHA to users",
											},
										],
									},
									message
								),
							],
						});
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

						return message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Set Verification Level`,
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
									},
									message
								),
							],
						});
				}
				break;
			case "role":
				if (!args.value)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"You must provide a role to set!"
							),
						],
					});

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

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Set Verification Role`,
								fields: [
									{
										name: "Before",
										value: oldRole
											? roleMention(oldRole)
											: "None",
										inline: true,
									},
									{
										name: "After",
										value: args.value.toString(),
										inline: true,
									},
								],
							},
							message
						),
					],
				});
		}
	}
}
