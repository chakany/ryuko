import { Listener, AkairoClient } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class DeleteListener extends Listener {
	client: AkairoClient;

	constructor(client: AkairoClient) {
		super("messageDelete", {
			emitter: "client",
			event: "messageDelete",
		});

		this.client = client;
	}

	async exec(message: Message) {
		if (!message.guild) return;
		const logChannel = this.client.settings.get(
			message.guild.id,
			"loggingChannel",
			"None"
		);
		if (logChannel === "None") return;

		// ignore direct messages
		const fetchedLogs = await message.guild.fetchAuditLogs({
			limit: 1,
			type: "MESSAGE_DELETE",
		});
		// Since we only have 1 audit log entry in this collection, we can simply grab the first one
		const deletionLog = fetchedLogs.entries.first();
		let content =
			message.content.length > 1800
				? message.content.substr(0, 1800) + "..."
				: message.content;

		// Let's perform a coherence check here and make sure we got *something*
		if (!deletionLog) {
			return (
				// @ts-ignore
				this.client.channels.cache
					.get(logChannel)
					// @ts-ignore
					.send(
						new MessageEmbed({
							title: "Message Deleted",
							description: "```diff\n" + `- "${content}"` + "\n```",
							color: 16716032,
							timestamp: new Date(),
							author: {
								name: `${message.author.tag} (${message.author.id})`,
								icon_url: message.author.avatarURL({ dynamic: true }) || "",
							},
							footer: {
								text: `No content ("") means that there was probably an embed there\n${message.client.user?.tag}`,
								icon_url:
									message.client.user?.avatarURL({ dynamic: true }) || "",
							},
							fields: [
								{
									name: "Channel",
									value: `<#${message.channel.id}>`,
									inline: true,
								},
								{
									name: "Deleted By",
									value: message.member,
									inline: true,
								},
							],
						})
					)
			);
		}

		// We now grab the user object of the person who deleted the message
		// Let us also grab the target of this action to double-check things
		const { executor, target } = deletionLog;
		if (executor.id === this.client.user!.id) return;

		// And now we can update our output with a bit more information
		// We will also run a check to make sure the log we got was for the same author's message
		// @ts-ignore
		if (target!.id === message.author.id) {
			return (
				// @ts-ignore
				this.client.channels.cache
					.get(logChannel)
					// @ts-ignore
					.send(
						new MessageEmbed({
							title: "Message Deleted",
							description: "```diff\n" + `- "${content}"` + "\n```",
							color: 16716032,
							timestamp: new Date(),
							author: {
								name: `${message.author.tag} (${message.author.id})`,
								icon_url: message.author.avatarURL({ dynamic: true }) || "",
							},
							footer: {
								text: `No content ("") means that there was probably an embed there\n${message.client.user?.tag}`,
								icon_url:
									message.client.user?.avatarURL({ dynamic: true }) || "",
							},
							fields: [
								{
									name: "Channel",
									value: `<#${message.channel.id}>`,
									inline: true,
								},
								{
									name: "Deleted By",
									value: executor,
									inline: true,
								},
							],
						})
					)
			);
		} else {
			return (
				// @ts-ignore
				this.client.channels.cache
					.get(logChannel)
					// @ts-ignore
					.send(
						new MessageEmbed({
							title: "Message Deleted",
							description: "```diff\n" + `- "${content}"` + "\n```",
							color: 16716032,
							timestamp: new Date(),
							author: {
								name: `${message.author.tag} (${message.author.id})`,
								icon_url: message.author.avatarURL({ dynamic: true }) || "",
							},
							footer: {
								text: `No content ("") means that there was probably an embed there\n${message.client.user?.tag}`,
								icon_url:
									message.client.user?.avatarURL({ dynamic: true }) || "",
							},
							fields: [
								{
									name: "Channel",
									value: `<#${message.channel.id}>`,
									inline: true,
								},
							],
						})
					)
			);
		}
	}
}
