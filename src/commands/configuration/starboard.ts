import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message } from "discord.js";
import { channelMention } from "@discordjs/builders";

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
		const enabled = this.client.settings.get(
			message.guild!.id,
			"starboard",
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
								} Starboard Subcommands`,
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
										name: `\`channel <channel>\``,
										value: `**Current Channel:** ${
											this.client.settings.get(
												message.guild!.id,
												"starboardChannel",
												null
											)
												? `${channelMention(
														this.client.settings.get(
															message.guild!.id,
															"starboardChannel",
															null
														)
												  )}`
												: "None"
										}\nChannel to send starred messages into`,
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
										? `The current channel for the starboard is ${channelMention(
												oldChannel
										  )}`
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
