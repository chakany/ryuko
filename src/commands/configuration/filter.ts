import Command from "../../struct/Command";
import { FieldsEmbed } from "discord-paginationembed";
import { Message, MessageEmbed, TextChannel } from "discord.js";

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
				message.channel.send(
					new MessageEmbed({
						title: "Filter Subcommands",
						description: `See more information on the [Moderation Wiki](${this.client.config.siteUrl}/wiki/Features/Moderation#filter)`,
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
					})
				);
				break;
			case "enable":
				this.client.settings.set(message.guild!.id, "filter", true);

				message.channel.send(
					new MessageEmbed({
						title: `${this.client.emoji.greenCheck} Enabled the Filter`,
						description: "The Filter has been enabled",
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

				if (
					this.client.settings.get(
						message.guild!.id,
						"logging",
						false
					)
				)
					(<TextChannel>(
						message.guild!.channels.cache.get(
							this.client.settings.get(
								message.guild!.id,
								"loggingChannel",
								null
							)
						)
					)).send(
						new MessageEmbed({
							title: `Filter Enabled`,
							color: message.guild?.me?.displayHexColor,
							thumbnail: {
								url: message.author.displayAvatarURL({
									dynamic: true,
								}),
							},
							timestamp: new Date(),
							fields: [
								{
									name: "Enabled By",
									value: message.member,
								},
							],
						})
					);
				break;
			case "disable":
				this.client.settings.set(message.guild!.id, "filter", false);

				message.channel.send(
					new MessageEmbed({
						title: `${this.client.emoji.greenCheck} Disabled the Filter`,
						description: "The Filter has been disabled",
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

				if (
					this.client.settings.get(
						message.guild!.id,
						"logging",
						false
					)
				)
					(<TextChannel>(
						message.guild!.channels.cache.get(
							this.client.settings.get(
								message.guild!.id,
								"loggingChannel",
								null
							)
						)
					)).send(
						new MessageEmbed({
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
									value: message.member,
								},
							],
						})
					);
				break;
			case "list":
				const phrases = await this.client.db.getFilteredPhrases(
					message.guild!.id
				);

				const phraseEmbed = new FieldsEmbed()
					.setArray(phrases)
					.setChannel(<TextChannel>message.channel)
					.setAuthorizedUsers([message.author.id])
					.setElementsPerPage(10)
					.formatField("Phrases", (phrase: any) => {
						return `\`${phrase.phrase}\``;
					})
					.setPage(1)
					.setPageIndicator(true);

				phraseEmbed.embed
					.setColor(message.guild!.me!.displayHexColor)
					.setTitle(`${message.guild!.name} Filtered Phrases`)
					.setThumbnail(
						message.guild!.iconURL({ dynamic: true }) || ""
					)
					.setTimestamp(new Date())
					.setFooter(
						message.author.tag,
						message.author.displayAvatarURL({ dynamic: true })
					);

				await phraseEmbed.build();
				break;
			case "add":
				if (!second_arg)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Arguments",
							"You must provide a Phrase to add!"
						)
					);

				if (
					await this.client.db.hasPhrase(
						message.guild!.id,
						second_arg
					)
				)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Argument",
							"That Phrase has already been added!"
						)
					);

				await this.client.db.addPhrase(message.guild!.id, second_arg);

				message.channel.send(
					new MessageEmbed({
						title: `${this.client.emoji.greenCheck} Added Phrase to Filter`,
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
								name: "Phrase",
								value: `\`${second_arg}\``,
							},
						],
					})
				);

				if (
					this.client.settings.get(
						message.guild!.id,
						"logging",
						false
					)
				)
					(<TextChannel>(
						message.guild!.channels.cache.get(
							this.client.settings.get(
								message.guild!.id,
								"loggingChannel",
								null
							)
						)
					)).send(
						new MessageEmbed({
							title: `Phrase Added to Filter`,
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
									name: "Added By",
									value: message.member,
								},
							],
						})
					);
				break;
			case "remove":
				if (!second_arg)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Arguments",
							"You must provide a Phrase to remove!"
						)
					);

				if (
					!(await this.client.db.hasPhrase(
						message.guild!.id,
						second_arg
					))
				)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Argument",
							"That Phrase has not been added!"
						)
					);

				await this.client.db.removePhrase(
					message.guild!.id,
					second_arg
				);

				message.channel.send(
					new MessageEmbed({
						title: `${this.client.emoji.greenCheck} Removed Phrase from Filter`,
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
								name: "Phrase",
								value: `\`${second_arg}\``,
							},
						],
					})
				);

				if (
					this.client.settings.get(
						message.guild!.id,
						"logging",
						false
					)
				)
					(<TextChannel>(
						message.guild!.channels.cache.get(
							this.client.settings.get(
								message.guild!.id,
								"loggingChannel",
								null
							)
						)
					)).send(
						new MessageEmbed({
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
									value: message.member,
								},
							],
						})
					);
		}
	}
}
