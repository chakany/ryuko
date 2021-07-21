import { Listener } from "discord-akairo";
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
			reaction.message.channel.type == "dm" ||
			reaction.emoji.name != "⭐" ||
			!this.client.settings.get(
				reaction.message.guild!.id,
				"starboard",
				false
			)
		)
			return;

		const message: Message = reaction.message;

		const fields = message.embeds[0].fields || [];

		const content = message.embeds[0].description || message.content

		const embed: MessageEmbed = new MessageEmbed({
			timestamp: message.createdTimestamp,
			title: "Jump to Message",
			url: `https://discord.com/channels/${message.guild!.id}/${message.channel.id}/${message.id}`,
			color: message.guild?.me?.displayHexColor,
			author: {
				name: message.author.tag,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			},
			footer: {
				text: `ID: ${message.id}`,
			},
			description: content ,
			fields: fields,
		});

		if (message.attachments.size > 0)
			embed.setImage(message.attachments.array()[0].url);
		else if (message.embeds[0]?.image?.url)
			embed.setImage(message.embeds[0]?.image?.url);
		else if (message.embeds[0]?.thumbnail?.url)
			embed.setImage(message.embeds[0]?.thumbnail?.url);

		return (<TextChannel>(
			message.guild?.channels.cache.get(
				this.client.settings.get(
					reaction.message.guild!.id,
					"starboardChannel",
					null
				)
			)
		)).send(embed);
	}
}
