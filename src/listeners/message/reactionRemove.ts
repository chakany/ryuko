import Listener from "../../struct/Listener";
import {
	MessageReaction,
	TextChannel,
	Message,
	MessageEmbed,
} from "discord.js";

export default class MessageReactionRemoveListener extends Listener {
	constructor() {
		super("messageReactionRemove", {
			emitter: "client",
			event: "messageReactionRemove",
		});
	}

	async exec(reaction: MessageReaction) {
		if (reaction.partial) await reaction.fetch();

		if (
			reaction.message.channel.type == "DM" ||
			reaction.emoji.name != "⭐"
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
				timestamp: message.createdTimestamp,
				title: "Jump to Message",
				url: `https://discord.com/channels/${message.guild!.id}/${
					message.channel.id
				}/${message.id}`,
				color: message.guild?.me?.displayHexColor,
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
			embed.setImage(Array.from(message.attachments.values())[0].url);
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
	}
}
