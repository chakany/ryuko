import Listener from "../../struct/Listener";
import { Message, MessageEmbed, TextChannel, User } from "discord.js";

export default class DeleteListener extends Listener {
	constructor() {
		super("messageDelete", {
			emitter: "client",
			event: "messageDelete",
		});
	}

	async exec(message: Message) {
		if (!message.guild) return;
		if (message.author.bot) return;

		const fetchedLogs = await message.guild.fetchAuditLogs({
			limit: 1,
			type: "MESSAGE_DELETE",
		});

		const deletionLog = fetchedLogs.entries.first();

		// concatinate message content if it is too long
		let content =
			message.content.length > 1900
				? message.content.substr(0, 1900) + "..."
				: message.content;

		if (!deletionLog)
			return this.client.sendToLogChannel(
				{
					embeds: [
						this.embed(
							{
								title: "Message Deleted",
								thumbnail: {
									url: message.author.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Content",
										value: content,
									},
									{
										name: "Author",
										value: message.author.toString(),
										inline: true,
									},
									{
										name: "Channel",
										value: message.channel.toString(),
										inline: true,
									},
								],
							},
							message.author,
							message.guild
						),
					],
				},
				message.guild
			);

		const { executor, target } = deletionLog;

		if ((<User>target).id == message.author.id)
			return this.client.sendToLogChannel(
				{
					embeds: [
						this.embed(
							{
								title: "Message Deleted",
								thumbnail: {
									url: message.author.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Content",
										value: content,
									},
									{
										name: "Author",
										value: message.author.toString(),
										inline: true,
									},
									{
										name: "Deleted by",
										value:
											executor?.toString() || "Unknown",
										inline: true,
									},
									{
										name: "Channel",
										value: message.channel.toString(),
										inline: true,
									},
								],
							},
							message.author,
							message.guild
						),
					],
				},
				message.guild
			);
		else
			return this.client.sendToLogChannel(
				{
					embeds: [
						this.embed(
							{
								title: "Message Deleted",
								thumbnail: {
									url: message.author.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Content",
										value: content,
									},
									{
										name: "Author",
										value: message.author.toString(),
										inline: true,
									},
									{
										name: "Channel",
										value: message.channel.toString(),
										inline: true,
									},
								],
							},
							message.author,
							message.guild
						),
					],
				},
				message.guild
			);
	}
}
