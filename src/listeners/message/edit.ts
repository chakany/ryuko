import { Listener } from "discord-akairo";
import { Message, MessageEmbed, TextChannel } from "discord.js";

export default class MessageEditListener extends Listener {
	constructor() {
		super("messageUpdate", {
			emitter: "client",
			event: "messageUpdate",
		});
	}

	async exec(oldMessage: Message, newMessage: Message) {
		// Stupid fucking checks
		if (oldMessage.partial) await oldMessage.fetch();
		if (newMessage.partial) await newMessage.fetch();
		if (oldMessage.content === newMessage.content) return;
		if (this.client.commandHandler.handleEdits)
			this.client.commandHandler.handle(newMessage);

		if (oldMessage.content === newMessage.content) return;
		if (!oldMessage.guild) return;
		if (oldMessage.author.discriminator === "0000") return;

		const logChannel = this.client.settings.get(
			oldMessage.guild.id,
			"messageLogChannel",
			null
		);

		if (!logChannel) return;
		if (oldMessage.author.bot) return;

		// Concatinate our message content if it is too long
		let _oldmessage =
			oldMessage.content.length > 900
				? oldMessage.content.substr(0, 600) + "..."
				: oldMessage.content;

		let _newmessage =
			newMessage.content.length > 900
				? newMessage.content.substr(0, 600) + "..."
				: newMessage.content;

		// Cast to please typescript
		return (<TextChannel>this.client.channels.cache.get(logChannel)).send(
			new MessageEmbed({
				title: "Message Edited",
				thumbnail: {
					url: oldMessage.author.displayAvatarURL({ dynamic: true }),
				},
				color: oldMessage.guild.me?.displayHexColor,
				timestamp: new Date(),
				fields: [
					{
						name: "Before",
						value: `[${_oldmessage}](${oldMessage.url} "Jump to Message")`,
					},
					{
						name: "After",
						value: `[${_newmessage}](${newMessage.url} "Jump to Message")`,
					},
					{
						name: "Author",
						value: oldMessage.author,
						inline: true,
					},
					{
						name: "Channel",
						value: oldMessage.channel,
						inline: true,
					},
				],
			})
		);
	}
}
