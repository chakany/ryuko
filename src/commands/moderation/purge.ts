import { Command } from "discord-akairo";
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
					id: "user",
					type: "member",
				},
			],
			modOnly: true,
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const victim = args.user;
		const count = args.count;

		if (!count)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide how many messages to delete!"
				)
			);
		if (count >= 100)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You cannot purge more than 100 message at once!"
				)
			);
		try {
			let deleted: Collection<string, Message>;
			const messages = await message.channel.messages.fetch({
				limit: count + 1,
			});

			// Fetches the messages
			if (victim) {
				deleted = messages.filter(
					(m) => m.author.id === victim.id || m.id === message.id
				);
			} else {
				deleted = messages;
			}
			if (!deleted.find((sus) => sus.id === message.id))
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Argument",
						"I could not find that user!"
					)
				);

			await (<TextChannel>message.channel)
				.bulkDelete(
					deleted // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
				)
				.catch((error) => {
					throw error;
				});

			const logchannel = this.client.settings.get(
				message.guild!.id,
				"loggingChannel",
				null
			);
			if (
				!logchannel ||
				!this.client.settings.get(message.guild!.id, "logging", false)
			)
				return;
			let purgeEmbed = new MessageEmbed({
				title: "Purge",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				fields: [
					{
						name: "Purged By",
						value: message.member,
						inline: true,
					},
					{
						name: "Channel",
						value: message.channel,
						inline: true,
					},
					{
						name: "Number of Messages",
						value: `\`${deleted.size}\``,
						inline: true,
					},
				],
			});

			const tempMessage = await message.channel.send(purgeEmbed);

			purgeEmbed.setThumbnail(
				message.author.displayAvatarURL({ dynamic: true })
			);

			(<TextChannel>this.client.channels.cache.get(logchannel)).send(
				purgeEmbed
			);

			setTimeout(() => tempMessage.delete(), 5000);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An error occurred",
					error.message
				)
			);
		}
	}
}
