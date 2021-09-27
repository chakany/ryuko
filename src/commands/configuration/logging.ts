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
					id: "subcommand",
					type: "string",
				},
				{
					id: "category",
					type: "string",
				},
				{
					id: "channel",
					type: "textChannel",
				},
			],
			description: "Changes the Logging Channel",
			userPermissions: ["MANAGE_GUILD"],
			clientPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const guildLogs = this.client.settings.get(
			message.guild!.id,
			"guildLogs",
			false
		);
		const memberLogs = this.client.settings.get(
			message.guild!.id,
			"memberLogs",
			false
		);
		const voiceLogs = this.client.settings.get(
			message.guild!.id,
			"voiceLogs",
			false
		);
		const messageLogs = this.client.settings.get(
			message.guild!.id,
			"messageLogs",
			false
		);

		switch (args.subcommand) {
			default:
				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `Logging Subcommands`,
								description: `***Categories:***\n\`all\` All categories listed below this one.\n${
									guildLogs
										? this.client.emoji.greenCheck
										: this.client.emoji.redX
								} ${
									this.client.settings.get(
										message.guild!.id,
										"guildLogsChannel",
										null
									)
										? channelMention(
												this.client.settings.get(
													message.guild!.id,
													"guildLogsChannel",
													null
												)
										  )
										: "None"
								} \`server\` General server things, like configuration updates, and typical changes in your server.\n${
									memberLogs
										? this.client.emoji.greenCheck
										: this.client.emoji.redX
								} ${
									this.client.settings.get(
										message.guild!.id,
										"memberLogsChannel",
										null
									)
										? channelMention(
												this.client.settings.get(
													message.guild!.id,
													"memberLogsChannel",
													null
												)
										  )
										: "None"
								} \`member\` Events like joins, leaves, bans, kicks, etc.\n${
									voiceLogs
										? this.client.emoji.greenCheck
										: this.client.emoji.redX
								} ${
									this.client.settings.get(
										message.guild!.id,
										"voiceLogsChannel",
										null
									)
										? channelMention(
												this.client.settings.get(
													message.guild!.id,
													"voiceLogsChannel",
													null
												)
										  )
										: "None"
								} \`voice\` Voice channel joins, moves, and disconnects.\n${
									messageLogs
										? this.client.emoji.greenCheck
										: this.client.emoji.redX
								} ${
									this.client.settings.get(
										message.guild!.id,
										"messageLogsChannel",
										null
									)
										? channelMention(
												this.client.settings.get(
													message.guild!.id,
													"messageLogsChannel",
													null
												)
										  )
										: "None"
								} \`message\` Events like message deletions, edits, and purges. \n\nSee more information on the [Logging Wiki](${
									this.client.config.siteUrl
								}/wiki/Features/Logging)`,
								fields: [
									{
										name: "`enable <category>`",
										value: "Enable logging for that category, see description for avaliable categories.",
									},
									{
										name: "`disable <category>`",
										value: "Disable logging, see description for avaliable categories.",
									},
									{
										name: "`channel <category> <channel>`",
										value: "Change the channel that logs for this category will be sent to.",
									},
								],
							},
							message
						),
					],
				});
				break;
			case "enable":
				switch (args.category) {
					case "all":
						// There is definitely a better way to do this, i don't want to think rn. Ship and then do my homework
						if (
							!this.client.settings.get(
								message.guild!.id,
								"guildLogsChannel",
								null
							)
						)
							return message.channel.send({
								embeds: [
									this.error(
										message,
										"Invalid Configuration",
										`You must set the channel for server logs first! Use the \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} channel server <channel>\``
									),
								],
							});

						if (
							!this.client.settings.get(
								message.guild!.id,
								"memberLogsChannel",
								null
							)
						)
							return message.channel.send({
								embeds: [
									this.error(
										message,
										"Invalid Configuration",
										`You must set the channel for member logs first! Use the \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} channel member <channel>\``
									),
								],
							});

						if (
							!this.client.settings.get(
								message.guild!.id,
								"voiceLogsChannel",
								null
							)
						)
							return message.channel.send({
								embeds: [
									this.error(
										message,
										"Invalid Configuration",
										`You must set the channel for voice logs first! Use the \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} channel voice <channel>\``
									),
								],
							});

						if (
							!this.client.settings.get(
								message.guild!.id,
								"messageLogsChannel",
								null
							)
						)
							return message.channel.send({
								embeds: [
									this.error(
										message,
										"Invalid Configuration",
										`You must set the channel for message logs first! Use the \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} channel messsage <channel>\``
									),
								],
							});

						this.client.settings.set(
							message.guild!.id,
							"guildLogs",
							true
						);
						this.client.settings.set(
							message.guild!.id,
							"memberLogs",
							true
						);
						this.client.settings.set(
							message.guild!.id,
							"voiceLogs",
							true
						);
						this.client.settings.set(
							message.guild!.id,
							"messageLogs",
							true
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Enabled All Logging Categories`,
										description: `\`server\` - ${channelMention(
											this.client.settings.get(
												message.guild!.id,
												"guildLogsChannel",
												null
											)
										)}\n\`member\` - ${channelMention(
											this.client.settings.get(
												message.guild!.id,
												"memberLogsChannel",
												null
											)
										)}\n\`voice\` - ${channelMention(
											this.client.settings.get(
												message.guild!.id,
												"voiceLogsChannel",
												null
											)
										)}\n\`message\` - ${channelMention(
											this.client.settings.get(
												message.guild!.id,
												"messageLogsChannel",
												null
											)
										)}`,
									},
									message
								),
							],
						});
						break;

					case "server":
						if (
							!this.client.settings.get(
								message.guild!.id,
								"guildLogsChannel",
								null
							)
						)
							return message.channel.send({
								embeds: [
									this.error(
										message,
										"Invalid Configuration",
										`You must set the channel for server logs first! Use the \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} channel server <channel>\``
									),
								],
							});

						this.client.settings.set(
							message.guild!.id,
							"guildLogs",
							true
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Enabled Server Logs`,
										fields: [
											{
												name: "Channel",
												value: channelMention(
													this.client.settings.get(
														message.guild!.id,
														"guildLogsChannel",
														null
													)
												),
											},
										],
									},
									message
								),
							],
						});
						break;

					case "member":
						if (
							!this.client.settings.get(
								message.guild!.id,
								"memberLogsChannel",
								null
							)
						)
							return message.channel.send({
								embeds: [
									this.error(
										message,
										"Invalid Configuration",
										`You must set the channel for member logs first! Use the \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} channel member <channel>\``
									),
								],
							});

						this.client.settings.set(
							message.guild!.id,
							"memberLogs",
							true
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Enabled Member Logs`,
										fields: [
											{
												name: "Channel",
												value: channelMention(
													this.client.settings.get(
														message.guild!.id,
														"memberLogsChannel",
														null
													)
												),
											},
										],
									},
									message
								),
							],
						});
						break;

					case "voice":
						if (
							!this.client.settings.get(
								message.guild!.id,
								"voiceLogsChannel",
								null
							)
						)
							return message.channel.send({
								embeds: [
									this.error(
										message,
										"Invalid Configuration",
										`You must set the channel for voice logs first! Use the \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} channel voice <channel>\``
									),
								],
							});

						this.client.settings.set(
							message.guild!.id,
							"voiceLogs",
							true
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Enabled Voice Logs`,
										fields: [
											{
												name: "Channel",
												value: channelMention(
													this.client.settings.get(
														message.guild!.id,
														"voiceLogsChannel",
														null
													)
												),
											},
										],
									},
									message
								),
							],
						});
						break;

					case "message":
						if (
							!this.client.settings.get(
								message.guild!.id,
								"messageLogsChannel",
								null
							)
						)
							return message.channel.send({
								embeds: [
									this.error(
										message,
										"Invalid Configuration",
										`You must set the channel for message logs first! Use the \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} channel message <channel>\``
									),
								],
							});

						this.client.settings.set(
							message.guild!.id,
							"messageLogs",
							true
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Enabled Message Logs`,
										fields: [
											{
												name: "Channel",
												value: channelMention(
													this.client.settings.get(
														message.guild!.id,
														"messageLogsChannel",
														null
													)
												),
											},
										],
									},
									message
								),
							],
						});
						break;
				}
				break;
			case "disable":
				switch (args.category) {
					case "all":
						this.client.settings.set(
							message.guild!.id,
							"guildLogs",
							false
						);
						this.client.settings.set(
							message.guild!.id,
							"memberLogs",
							false
						);
						this.client.settings.set(
							message.guild!.id,
							"voiceLogs",
							false
						);
						this.client.settings.set(
							message.guild!.id,
							"messageLogs",
							false
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Disabled All Logging Categories`,
									},
									message
								),
							],
						});
						break;

					case "server":
						this.client.settings.set(
							message.guild!.id,
							"guildLogs",
							false
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Disabled Server Logs`,
									},
									message
								),
							],
						});
						break;

					case "member":
						this.client.settings.set(
							message.guild!.id,
							"memberLogs",
							false
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Disabled Member Logs`,
									},
									message
								),
							],
						});
						break;

					case "voice":
						this.client.settings.set(
							message.guild!.id,
							"voiceLogs",
							false
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Disabled Voice Logs`,
									},
									message
								),
							],
						});
						break;

					case "message":
						this.client.settings.set(
							message.guild!.id,
							"messageLogs",
							false
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Disabled Message Logs`,
									},
									message
								),
							],
						});
						break;
				}
				break;
			case "channel":
				switch (args.category) {
					case "all":
						if (!args.channel)
							return message.channel.send({
								embeds: [
									this.embed(
										{
											title: "Logging Channels",
											description: `${
												guildLogs
													? this.client.emoji
															.greenCheck
													: this.client.emoji.redX
											} \`server\` - ${
												this.client.settings.get(
													message.guild!.id,
													"guildLogsChannel",
													null
												)
													? channelMention(
															this.client.settings.get(
																message.guild!
																	.id,
																"guildLogsChannel",
																null
															)
													  )
													: "None"
											}\n${
												memberLogs
													? this.client.emoji
															.greenCheck
													: this.client.emoji.redX
											} \`member\` - ${
												this.client.settings.get(
													message.guild!.id,
													"memberLogsChannel",
													null
												)
													? channelMention(
															this.client.settings.get(
																message.guild!
																	.id,
																"memberLogsChannel",
																null
															)
													  )
													: "None"
											}\n${
												voiceLogs
													? this.client.emoji
															.greenCheck
													: this.client.emoji.redX
											} \`voice\` - ${
												this.client.settings.get(
													message.guild!.id,
													"voiceLogsChannel",
													null
												)
													? channelMention(
															this.client.settings.get(
																message.guild!
																	.id,
																"voiceLogsChannel",
																null
															)
													  )
													: "None"
											}\n${
												messageLogs
													? this.client.emoji
															.greenCheck
													: this.client.emoji.redX
											} \`message\` - ${
												this.client.settings.get(
													message.guild!.id,
													"messageLogsChannel",
													null
												)
													? channelMention(
															this.client.settings.get(
																message.guild!
																	.id,
																"messageLogsChannel",
																null
															)
													  )
													: "None"
											}`,
										},
										message
									),
								],
							});

						this.client.settings.set(
							message.guild!.id,
							"guildLogsChannel",
							args.channel.id
						);

						this.client.settings.set(
							message.guild!.id,
							"memberLogsChannel",
							args.channel.id
						);

						this.client.settings.set(
							message.guild!.id,
							"voiceLogsChannel",
							args.channel.id
						);

						this.client.settings.set(
							message.guild!.id,
							"messageLogsChannel",
							args.channel.id
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Changed All Logging Channels`,
										description: `${
											guildLogs
												? this.client.emoji.greenCheck
												: this.client.emoji.redX
										} \`server\` - ${
											this.client.settings.get(
												message.guild!.id,
												"guildLogsChannel",
												null
											)
												? channelMention(
														this.client.settings.get(
															message.guild!.id,
															"guildLogsChannel",
															null
														)
												  )
												: "None"
										}\n${
											memberLogs
												? this.client.emoji.greenCheck
												: this.client.emoji.redX
										} \`member\` - ${
											this.client.settings.get(
												message.guild!.id,
												"memberLogsChannel",
												null
											)
												? channelMention(
														this.client.settings.get(
															message.guild!.id,
															"memberLogsChannel",
															null
														)
												  )
												: "None"
										}\n${
											voiceLogs
												? this.client.emoji.greenCheck
												: this.client.emoji.redX
										} \`voice\` - ${
											this.client.settings.get(
												message.guild!.id,
												"voiceLogsChannel",
												null
											)
												? channelMention(
														this.client.settings.get(
															message.guild!.id,
															"voiceLogsChannel",
															null
														)
												  )
												: "None"
										}\n${
											messageLogs
												? this.client.emoji.greenCheck
												: this.client.emoji.redX
										} \`message\` - ${
											this.client.settings.get(
												message.guild!.id,
												"messageLogsChannel",
												null
											)
												? channelMention(
														this.client.settings.get(
															message.guild!.id,
															"messageLogsChannel",
															null
														)
												  )
												: "None"
										}`,
									},
									message
								),
							],
						});
						break;

					case "server":
						if (!args.channel)
							return message.channel.send({
								embeds: [
									this.embed(
										{
											title: `${
												guildLogs
													? this.client.emoji
															.greenCheck
													: this.client.emoji.redX
											} Server Logs Channel`,
											fields: [
												{
													name: "Channel",
													value: this.client.settings.get(
														message.guild!.id,
														"guildLogsChannel",
														null
													)
														? channelMention(
																this.client.settings.get(
																	message.guild!
																		.id,
																	"guildLogsChannel",
																	null
																)
														  )
														: "None",
												},
											],
										},
										message
									),
								],
							});

						const oldGuildLogsChannel = this.client.settings.get(
							message.guild!.id,
							"guildLogsChannel",
							null
						);

						this.client.settings.set(
							message.guild!.id,
							"guildLogsChannel",
							args.channel.id
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Changed Server Logs Channel`,
										fields: [
											{
												name: "Before",
												value: oldGuildLogsChannel
													? channelMention(
															oldGuildLogsChannel
													  )
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
						break;

					case "member":
						if (!args.channel)
							return message.channel.send({
								embeds: [
									this.embed(
										{
											title: `${
												memberLogs
													? this.client.emoji
															.greenCheck
													: this.client.emoji.redX
											} Member Logs Channel`,
											fields: [
												{
													name: "Channel",
													value: this.client.settings.get(
														message.guild!.id,
														"memberLogsChannel",
														null
													)
														? channelMention(
																this.client.settings.get(
																	message.guild!
																		.id,
																	"memberLogsChannel",
																	null
																)
														  )
														: "None",
												},
											],
										},
										message
									),
								],
							});

						const oldMemberLogsChannel = this.client.settings.get(
							message.guild!.id,
							"memberLogsChannel",
							null
						);

						this.client.settings.set(
							message.guild!.id,
							"memberLogsChannel",
							args.channel.id
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Changed Member Logs Channel`,
										fields: [
											{
												name: "Before",
												value: oldMemberLogsChannel
													? channelMention(
															oldMemberLogsChannel
													  )
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
						break;

					case "voice":
						if (!args.channel)
							return message.channel.send({
								embeds: [
									this.embed(
										{
											title: `${
												memberLogs
													? this.client.emoji
															.greenCheck
													: this.client.emoji.redX
											} Voice Logs Channel`,
											fields: [
												{
													name: "Channel",
													value: this.client.settings.get(
														message.guild!.id,
														"voiceLogsChannel",
														null
													)
														? channelMention(
																this.client.settings.get(
																	message.guild!
																		.id,
																	"voiceLogsChannel",
																	null
																)
														  )
														: "None",
												},
											],
										},
										message
									),
								],
							});

						const oldVoiceLogsChannel = this.client.settings.get(
							message.guild!.id,
							"voiceLogsChannel",
							null
						);

						this.client.settings.set(
							message.guild!.id,
							"voiceLogsChannel",
							args.channel.id
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Changed Voice Logs Channel`,
										fields: [
											{
												name: "Before",
												value: oldVoiceLogsChannel
													? channelMention(
															oldVoiceLogsChannel
													  )
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
						break;

					case "message":
						if (!args.channel)
							return message.channel.send({
								embeds: [
									this.embed(
										{
											title: `${
												memberLogs
													? this.client.emoji
															.greenCheck
													: this.client.emoji.redX
											} Message Logs Channel`,
											fields: [
												{
													name: "Channel",
													value: this.client.settings.get(
														message.guild!.id,
														"messageLogsChannel",
														null
													)
														? channelMention(
																this.client.settings.get(
																	message.guild!
																		.id,
																	"messageLogsChannel",
																	null
																)
														  )
														: "None",
												},
											],
										},
										message
									),
								],
							});

						const oldMessageLogsChannel = this.client.settings.get(
							message.guild!.id,
							"messageLogsChannel",
							null
						);

						this.client.settings.set(
							message.guild!.id,
							"messageLogsChannel",
							args.channel.id
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Changed Message Logs Channel`,
										fields: [
											{
												name: "Before",
												value: oldMessageLogsChannel
													? channelMention(
															oldMessageLogsChannel
													  )
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
						break;
				}
				break;
		}
	}
}
