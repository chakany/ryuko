import Command from "../../struct/Command";
import { Message } from "discord.js";
import { channelMention } from "@discordjs/builders";

export default class VoiceLobbiesCommand extends Command {
	constructor() {
		super("voicelobbies", {
			aliases: ["voicelobbies"],
			description: "Update the voice lobbies configuration",
			category: "Configuration",
			args: [
				{
					id: "subcommand",
					type: "string",
				},
				{
					id: "channel",
					type: "voiceChannel",
				},
			],
		});
	}

	async exec(message: Message, args: any) {
		const enabled = this.client.settings.get(
			message.guild!.id,
			"voiceLobbies",
			false
		);

		switch (args.subcommand) {
			default:
				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${
									enabled
										? this.client.emoji.greenCheck
										: this.client.emoji.redX
								} Voice Lobbies Subcommands`,
								description: `See more information on the [Lobbies Wiki](${this.client.config.siteUrl}/wiki/Features/Voice-Lobbies)`,
								fields: [
									{
										name: "`enable`",
										value: "Enable Voice Lobbies",
									},
									{
										name: "`disable`",
										value: "Disable Voice Lobbies",
									},
									{
										name: `\`channel\``,
										value: `**Current Channel:** ${
											this.client.settings.get(
												message.guild!.id,
												"voiceLobbyChannel",
												null
											)
												? `${channelMention(
														this.client.settings.get(
															message.guild!.id,
															"voiceLobbyChannel",
															null
														)
												  )}`
												: "None"
										}\nSet the Lobby Channel`,
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
						"voiceLobbyChannel",
						null
					)
				)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Configuration",
								`You must set a lobby voice channel first!\nUse \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} channel <channel>\` to set it`
							),
						],
					});

				this.client.settings.set(
					message.guild!.id,
					"voiceLobbies",
					true
				);

				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Enabled Voice Lobbies`,
							},
							message
						),
					],
				});
				break;

			case "disable":
				this.client.settings.set(
					message.guild!.id,
					"voiceLobbies",
					false
				);

				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Disabled Voice Lobbies`,
							},
							message
						),
					],
				});
				break;

			case "channel":
				const channel = args.channel;
				if (!channel || channel.type !== "GUILD_VOICE")
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"That is not a Voice Channel!"
							),
						],
					});
				const oldChannel = this.client.settings.get(
					message.guild!.id,
					"voiceLobbyChannel",
					null
				);
				this.client.settings.set(
					message.guild!.id,
					"voiceLobbyChannel",
					channel!.id
				);

				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Changed Lobby Channel`,
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
										value: channel
											? channel.toString()
											: "None",
										inline: true,
									},
								],
							},
							message
						),
					],
				});
				break;
		}
	}
}
