import Listener from "../../struct/Listener";
import {
	MessageReaction,
	TextChannel,
	Message,
	MessageEmbed,
} from "discord.js";

export default class MessageReactionAddListener extends Listener {
	constructor() {
		super("messageReactionAdd", {
			emitter: "client",
			event: "messageReactionAdd",
		});
	}

	async exec(reaction: MessageReaction) {
		if (reaction.partial) await reaction.fetch();
		if (
			reaction.message.channel.type == "DM" ||
			reaction.emoji.name != "⭐" ||
			!this.client.settings.get(
				reaction.message.guild!.id,
				"starboard",
				false
			)
		)
			return;

		if (reaction.message.partial) await reaction.message.fetch();

		const message = reaction.message as Message;

		const fields = message.embeds[0] ? message.embeds[0].fields : [];

		const content = message.embeds[0]
			? message.embeds[0].description
			: message.content;

		const embed: MessageEmbed = this.embed(
			{
				title: "Jump to Message",
				url: `https://discord.com/channels/${message.guild!.id}/${
					message.channel.id
				}/${message.id}`,
				timestamp: message.createdTimestamp,
				author: {
					name: message.author.tag,
					iconURL: message.author.displayAvatarURL({ dynamic: true }),
				},
				footer: {
					text: `ID: ${message.id}`,
				},
				description: content!,
				fields: fields,
			},
			message.author,
			message.guild!
		);

		if (message.attachments.size > 0)
			embed.setImage(message.attachments.array()[0].url);
		else if (message.embeds[0]?.image?.url)
			embed.setImage(message.embeds[0]?.image?.url);
		else if (message.embeds[0]?.thumbnail?.url)
			embed.setImage(message.embeds[0]?.thumbnail?.url);

		const starredMessage = this.client.starboardMessages.get(message.id);

		if (starredMessage)
			return starredMessage.edit({
				content: `${reaction.count} :star: | ${message.channel}`,
				embeds: [embed],
			});

		const newMessage = await (<TextChannel>(
			await message.guild?.channels.fetch(
				this.client.settings.get(
					reaction.message.guild!.id,
					"starboardChannel",
					null
				)
			)
		)).send({
			content: `${reaction.count} :star: | ${message.channel}`,
			embeds: [embed],
		});

		this.client.starboardMessages.set(message.id, newMessage);
	}
}
