import Command from "../../struct/Command";
import { TextChannel } from "discord.js";
import { Message, MessageEmbed, Collection } from "discord.js";

export default class PurgeCommand extends Command {
	constructor() {
		super("purge", {
			aliases: ["purge"],
			category: "Moderation",
			description: "Deletes user messages",
			clientPermissions: ["MANAGE_MESSAGES"],
			userPermissions: ["MANAGE_MESSAGES"],

			args: [
				{
					id: "count",
					type: "number",
				},
				{
					id: "member",
					type: "member",
				},
			],
			modOnly: true,
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const victim = args.member;
		const count = args.count;

		if (!count)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide how many messages to delete!",
					),
				],
			});
		if (count >= 100)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You cannot purge more than 100 message at once!",
					),
				],
			});

		let deleted: Collection<string, Message>;
		const messages = await message.channel.messages.fetch({
			limit: count + 1,
		});

		// Fetches the messages
		if (victim) {
			deleted = messages.filter(
				(m) => m.author.id === victim.id || m.id === message.id,
			);
		} else {
			deleted = messages;
		}
		if (!deleted.find((sus) => sus.id === message.id))
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"I could not find that user!",
					),
				],
			});

		await (<TextChannel>message.channel)
			.bulkDelete(
				deleted, // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
			)
			.catch((error) => {
				throw error;
			});

		const logchannel = this.client.settings.get(
			message.guild!.id,
			"loggingChannel",
			null,
		);
		if (
			!logchannel ||
			!this.client.settings.get(message.guild!.id, "logging", false)
		)
			return;

		const tempMessage = await message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Purge",
						fields: [
							{
								name: "Purged By",
								value: message.member!.toString(),
								inline: true,
							},
							{
								name: "Channel",
								value: message.channel!.toString(),
								inline: true,
							},
							{
								name: "Number of Messages",
								value: `\`${deleted.size}\``,
								inline: true,
							},
						],
					},
					message,
				),
			],
		});

		this.client.sendToLogChannel(message.guild!, "message", {
			embeds: [
				this.embed(
					{
						title: "Purge",
						thumbnail: {
							url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
						footer: {},
						fields: [
							{
								name: "Purged By",
								value: message.member!.toString(),
								inline: true,
							},
							{
								name: "Channel",
								value: message.channel!.toString(),
								inline: true,
							},
							{
								name: "Number of Messages",
								value: `\`${deleted.size}\``,
								inline: true,
							},
						],
					},
					message,
				),
			],
		});

		setTimeout(() => tempMessage.delete(), 5000);
	}
}
