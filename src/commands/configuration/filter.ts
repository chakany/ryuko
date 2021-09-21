import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import { MessagePagination } from "@ryukobot/paginationembed";

export default class FilterCommand extends Command {
	constructor() {
		super("filter", {
			aliases: ["filter"],
			category: "Configuration",
			args: [
				{
					id: "action",
					type: "string",
				},
				{
					id: "phrase",
					type: "string",
				},
			],
			description: "Update the Filter Configuration",
			userPermissions: ["MANAGE_MESSAGES"],
			modOnly: true,
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const second_arg = args["phrase"];
		const enabled = this.client.settings.get(
			message.guild!.id,
			"filter",
			false
		);

		switch (args.action) {
			default:
				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${
									enabled
										? this.client.emoji.greenCheck
										: this.client.emoji.redX
								} Filter Subcommands`,
								description: `See more information on the [Moderation Wiki](${this.client.config.siteUrl}/wiki/Features/Moderation#filter)`,
								fields: [
									{
										name: "`enable`",
										value: "Enable the Filter",
									},
									{
										name: "`disable`",
										value: "Disable the Filter",
									},
									{
										name: `${
											this.client.settings.get(
												message.guild!.id,
												"filterBypass",
												false
											)
												? this.client.emoji.greenCheck
												: this.client.emoji.redX
										} \`bypass <value>\``,
										value: "Toggle the ability for Moderators, Admins, and Members with the Manage Messages Permission to bypass the filter\n`enable` Enable Filter Bypass\n`disable` Disable Filter Bypass",
									},
									{
										name: "`list`",
										value: "List all Phrases in the Filter",
									},
									{
										name: "`add <phrase>`",
										value: "Add a Phrase to the Filter",
									},
									{
										name: "`remove <phrase>`",
										value: "Remove a Phrase from the Filter",
									},
								],
							},
							message
						),
					],
				});
				break;
			case "enable":
				this.client.settings.set(message.guild!.id, "filter", true);

				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Enabled Filter`,
							},
							message
						),
					],
				});

				this.client.sendToLogChannel(
					{
						embeds: [
							this.embed(
								{
									title: `Filter Enabled`,
									thumbnail: {
										url: message.author.displayAvatarURL({
											dynamic: true,
										}),
									},
									footer: {},
									fields: [
										{
											name: "Enabled By",
											value: message.member!.toString(),
										},
									],
								},
								message
							),
						],
					},
					message.guild!
				);
				break;
			case "disable":
				this.client.settings.set(message.guild!.id, "filter", false);

				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Disabled Filter`,
							},
							message
						),
					],
				});

				this.client.sendToLogChannel(
					{
						embeds: [
							this.embed(
								{
									title: `Filter Disabled`,
									thumbnail: {
										url: message.author.displayAvatarURL({
											dynamic: true,
										}),
									},
									footer: {},
									fields: [
										{
											name: "Disabled By",
											value: message.member!.toString(),
										},
									],
								},
								message
							),
						],
					},
					message.guild!
				);
				break;
			case "bypass":
				switch (second_arg) {
					default:
						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${
											this.client.settings.get(
												message.guild!.id,
												"filterBypass",
												false
											)
												? this.client.emoji.greenCheck
												: this.client.emoji.redX
										} Filter Bypass`,
										description: `Allow Moderators, Admins, and Members with the Manage Messages permission to bypass the filter`,
										fields: [
											{
												name: `\`enable\``,
												value: "Enable Filter Bypass",
											},
											{
												name: `\`disable\``,
												value: "Disable Filter Bypass",
											},
										],
									},
									message
								),
							],
						});
						break;
					case "enable":
						this.client.settings.set(
							message.guild!.id,
							"filterBypass",
							true
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Enabled Filter Bypass`,
									},
									message
								),
							],
						});

						this.client.sendToLogChannel(
							{
								embeds: [
									this.embed(
										{
											title: `Filter Bypass Enabled`,
											description: `Moderators, Admins, and Members with the Manage Messages permission can now bypass the filter.`,
											thumbnail: {
												url: message.author.displayAvatarURL(
													{
														dynamic: true,
													}
												),
											},
											footer: {},
											fields: [
												{
													name: "Enabled By",
													value: message.member!.toString(),
												},
											],
										},
										message
									),
								],
							},
							message.guild!
						);
						break;
					case "disable":
						this.client.settings.set(
							message.guild!.id,
							"filterBypass",
							false
						);

						message.channel.send({
							embeds: [
								this.embed(
									{
										title: `${this.client.emoji.greenCheck} Disabled Filter Bypass`,
									},
									message
								),
							],
						});

						this.client.sendToLogChannel(
							{
								embeds: [
									this.embed(
										{
											title: `Filter Bypass Disabled`,
											description: `Moderators, Admins, and Members with the Manage Messages permission can no longer bypass the filter.`,
											thumbnail: {
												url: message.author.displayAvatarURL(
													{
														dynamic: true,
													}
												),
											},
											footer: {},
											fields: [
												{
													name: "Disabled By",
													value: message.member!.toString(),
												},
											],
										},
										message
									),
								],
							},
							message.guild!
						);
						break;
				}

				break;
			case "list":
				const phrases = await this.client.db.getFilteredPhrases(
					message.guild!.id
				);

				const phrasesEmbed = new MessagePagination({
					message,
					itemsPerPage: 10,
					array: phrases,
					embed: this.embed(
						{
							title: `${message.guild!.name}'s Filtered Phrases`,
							thumbnail: {
								url:
									message.guild!.iconURL({ dynamic: true }) ||
									"",
							},
						},
						message
					),
					title: "Phrases",
					callbackfn: (phrase: any) => `\`${phrase.phrase}\``,
				});

				phrasesEmbed.build();
				break;
			case "add":
				if (!second_arg)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"You must provide a Phrase to add!"
							),
						],
					});

				if (
					await this.client.db.hasPhrase(
						message.guild!.id,
						second_arg
					)
				)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Argument",
								"That Phrase has already been added!"
							),
						],
					});

				await this.client.db.addPhrase(message.guild!.id, second_arg);

				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Added Phrase to Filter`,
								fields: [
									{
										name: "Phrase",
										value: `\`${second_arg}\``,
									},
								],
							},
							message
						),
					],
				});

				this.client.sendToLogChannel(
					{
						embeds: [
							this.embed(
								{
									title: `Phrase Added to Filter`,
									thumbnail: {
										url: message.author.displayAvatarURL({
											dynamic: true,
										}),
									},
									footer: {},
									fields: [
										{
											name: "Phrase",
											value: `\`${second_arg}\``,
										},
										{
											name: "Added By",
											value: message.member!.toString(),
										},
									],
								},
								message
							),
						],
					},
					message.guild!
				);
				break;
			case "remove":
				if (!second_arg)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"You must provide a Phrase to remove!"
							),
						],
					});

				if (
					!(await this.client.db.hasPhrase(
						message.guild!.id,
						second_arg
					))
				)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Argument",
								"That Phrase has not been added!"
							),
						],
					});

				await this.client.db.removePhrase(
					message.guild!.id,
					second_arg
				);

				message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Removed Phrase from Filter`,
								fields: [
									{
										name: "Phrase",
										value: `\`${second_arg}\``,
									},
								],
							},
							message
						),
					],
				});

				this.client.sendToLogChannel(
					{
						embeds: [
							this.embed(
								{
									title: `Phrase Removed from Filter`,
									thumbnail: {
										url: message.author.displayAvatarURL({
											dynamic: true,
										}),
									},
									footer: {},
									fields: [
										{
											name: "Phrase",
											value: `\`${second_arg}\``,
										},
										{
											name: "Removed By",
											value: message.member!.toString(),
										},
									],
								},
								message
							),
						],
					},
					message.guild!
				);
		}
	}
}
