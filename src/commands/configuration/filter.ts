import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import PaginationEmbed from "../../utils/PaginationEmbed";

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

		switch (args.action) {
			default:
				message.channel.send({
					embeds: [
						this.embed(
							{
								title: "Filter Subcommands",
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
								title: `${this.client.emoji.greenCheck} Enabled the Filter`,
								description: "The Filter has been enabled",
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
								title: `${this.client.emoji.greenCheck} Disabled the Filter`,
								description: "The Filter has been disabled",
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
									color: message.guild?.me?.displayHexColor,
									thumbnail: {
										url: message.author.displayAvatarURL({
											dynamic: true,
										}),
									},
									timestamp: new Date(),
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
			case "list":
				const phrases = await this.client.db.getFilteredPhrases(
					message.guild!.id
				);

				const phrasesEmbed = new PaginationEmbed(message)
					.format((phrase: any) => {
						return `\`${phrase.phrase}\``;
					})
					.setFieldName("Phrases")
					.setExpireTime(60000);

				phrasesEmbed.setEmbed({
					title: `${message.guild!.name} Filtered Phrases`,
					thumbnail: {
						url: message.guild!.iconURL({ dynamic: true }) || "",
					},
				});

				await phrasesEmbed.send(phrases, 10);
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
									color: message.guild?.me?.displayHexColor,
									thumbnail: {
										url: message.author.displayAvatarURL({
											dynamic: true,
										}),
									},
									timestamp: new Date(),
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
