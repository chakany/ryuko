import { Listener } from "discord-akairo";
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

		const logChannelId = this.client.settings.get(
			message.guild.id,
			"messageLogChannel",
			null
		);
		if (!logChannelId) return;

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

		const logChannel = <TextChannel>(
			message.guild!.channels.cache.get(logChannelId)
		);

		if (!deletionLog)
			return logChannel.send(
				new MessageEmbed({
					title: "Message Deleted",
					thumbnail: {
						url: message.author.displayAvatarURL({ dynamic: true }),
					},
					color: message.guild.me?.displayHexColor,
					timestamp: new Date(),
					fields: [
						{
							name: "Content",
							value: content,
						},
						{
							name: "Author",
							value: message.author,
							inline: true,
						},
						{
							name: "Channel",
							value: message.channel,
							inline: true,
						},
					],
				})
			);

		const { executor, target } = deletionLog;

		if ((<User>target).id == message.author.id)
			return logChannel.send(
				new MessageEmbed({
					title: "Message Deleted",
					thumbnail: {
						url: message.author.displayAvatarURL({ dynamic: true }),
					},
					color: message.guild.me?.displayHexColor,
					timestamp: new Date(),
					author: {
						name: (<User>executor).tag,
						icon_url: (<User>executor).displayAvatarURL({
							dynamic: true,
						}),
						url: `https://discord.com/users/${(<User>executor).id}`,
					},
					fields: [
						{
							name: "Content",
							value: content,
						},
						{
							name: "Author",
							value: message.author,
							inline: true,
						},
						{
							name: "Deleted by",
							value: <User>executor,
							inline: true,
						},
						{
							name: "Channel",
							value: message.channel,
							inline: true,
						},
					],
				})
			);
		else
			return logChannel.send(
				new MessageEmbed({
					title: "Message Deleted",
					thumbnail: {
						url: message.author.displayAvatarURL({ dynamic: true }),
					},
					color: message.guild.me?.displayHexColor,
					timestamp: new Date(),
					fields: [
						{
							name: "Content",
							value: content,
						},
						{
							name: "Author",
							value: message.author,
							inline: true,
						},
						{
							name: "Channel",
							value: message.channel,
							inline: true,
						},
					],
				})
			);
	}
}
