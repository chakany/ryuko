import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message } from "discord.js";
import { channelMention } from "@discordjs/builders";

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
			clientPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const enabled = this.client.settings.get(
			message.guild!.id,
			"logging",
			false
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
								} Logging Subcommands`,
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
										name: `\`channel <channel>\``,
										value: `**Current Channel:** ${
											this.client.settings.get(
												message.guild!.id,
												"loggingChannel",
												null
											)
												? `${channelMention(
														this.client.settings.get(
															message.guild!.id,
															"loggingChannel",
															null
														)
												  )}`
												: "None"
										}\nChannel to send logs into`,
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
										? `The current channel for logging is ${channelMention(
												oldChannel
										  )}`
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
											? channelMention(oldChannel)
											: "None",
										inline: true,
									},
									{
										name: "After",
										value: args.channel.toString(),
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
