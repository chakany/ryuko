import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class StarboardCommand extends Command {
	constructor() {
		super("starboard", {
			aliases: ["starboard"],
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
			description: "Update configuration for the Starboard",
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
								title: "Starboard Subcommands",
								description: `See more information on the [Starboard Wiki](${this.client.config.siteUrl}/wiki/Features/Starboard)`,
								fields: [
									{
										name: "`enable`",
										value: "Enable the Starboard",
									},
									{
										name: "`disable`",
										value: "Disable the Starboard",
									},
									{
										name: "`channel <channel>`",
										value: "Channel to send starred messages into",
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
						"starboardChannel",
						null
					)
				)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Configuration",
								"You must set a channel to send starred messages into!"
							),
						],
					});
				this.client.settings.set(message.guild!.id, "starboard", true);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Enabled Starboard`,
								description: "The Starboard has been enabled",
							},
							message
						),
					],
				});
				break;
			case "disable":
				this.client.settings.set(message.guild!.id, "starboard", false);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Disabled Starboard`,
								description: "The Starboard has been disabled",
							},
							message
						),
					],
				});
				break;
			case "channel":
				const oldChannel = this.client.settings.get(
					message.guild!.id,
					"starboardChannel",
					null
				);

				if (!args.channel)
					return message.channel.send({
						embeds: [
							this.embed(
								{
									title: "Current Starboard Channel",
									description: oldChannel
										? `The current channel for the starboard is <#${oldChannel}>`
										: "There is no current channel for the starboard",
								},
								message
							),
						],
					});
				this.client.settings.set(
					message.guild!.id,
					"starboardChannel",
					args.channel.id
				);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Changed Starboard Channel`,
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
