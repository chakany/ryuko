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
							description:
								"```diff\n" +
								`- ${message.author.tag} (${message.author.id}): "${message.content}"` +
								"\n```",
							color: 16716032,
							timestamp: new Date(),
							footer: {
								text: `We couldn't find who deleted this message\nNo content ("") means that there was probably an embed there\n${message.client.user?.tag}`,
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
							description:
								"```diff\n" +
								`- ${message.author.tag} (${message.author.id}): "${message.content}"` +
								"\n```",
							color: 16716032,
							timestamp: new Date(),
							author: {
								name: executor.tag + " (" + executor.id + ")",
								icon_url: executor.avatarURL({ dynamic: true }) || "",
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
		} else {
			return (
				// @ts-ignore
				this.client.channels.cache
					.get(logChannel)
					// @ts-ignore
					.send(
						new MessageEmbed({
							title: "Message Deleted",
							description:
								"```diff\n" +
								`- ${message.author.tag} (${message.author.id}): "${message.content}"` +
								"\n```",
							color: 16716032,
							timestamp: new Date(),
							footer: {
								text: `This message was possibly deleted by a bot or the person who sent it\nNo content ("") means that there was probably an embed there\n${message.client.user?.tag}`,
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
