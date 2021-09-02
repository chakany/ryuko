import { Argument } from "discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class LoggingCommand extends Command {
	constructor() {
		super("logging", {
			aliases: ["logging", "logs", "log"],
			category: "Configuration",
			args: [
				{
					id: "action",
					type: "string",
				},
				{
					id: "channel",
					type: Argument.union("textChannel", "string"),
				},
			],
			description: "Changes the Logging Channel",

			userPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		switch (args.action) {
			default:
				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: "Logging Subcommands",
								description: `See more information on the [Logging Wiki](${this.client.config.siteUrl}/wiki/Features/Logging)`,
								fields: [
									{
										name: "`enable`",
										value: "Enable logging",
									},
									{
										name: "`disable`",
										value: "Disable logging",
									},
									{
										name: "`channel <channel>`",
										value: "Channel to send logs into",
									},
								],
							},
							message
						),
					],
				});
				break;
			case "enable":
				this.client.settings.set(message.guild!.id, "logging", true);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Enabled Logging`,
								description: "Logging has been enabled",
								color: message.guild?.me?.displayHexColor,
								timestamp: new Date(),
								footer: {
									text: message.author.tag,
									icon_url: message.author.displayAvatarURL({
										dynamic: true,
									}),
								},
							},
							message
						),
					],
				});
				break;
			case "disable":
				this.client.settings.set(message.guild!.id, "logging", false);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Disabled Logging`,
								description: "Logging has been disabled",
							},
							message
						),
					],
				});
				break;
			case "channel":
				const oldChannel = this.client.settings.get(
					message.guild!.id,
					"loggingChannel",
					null
				);

				if (!args.channel)
					return message.channel.send({
						embeds: [
							this.embed(
								{
									title: "Current Logging Channel",
									description: oldChannel
										? `The current channel for logging is <#${oldChannel}>`
										: "There is no current channel for logging",
								},
								message
							),
						],
					});
				this.client.settings.set(
					message.guild!.id,
					"loggingChannel",
					args.channel.id
				);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Changed Logging Channel`,
								fields: [
									{
										name: "Before",
										value: oldChannel
											? `<#${oldChannel}>`
											: "None",
										inline: true,
									},
									{
										name: "After",
										value: args.channel,
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
