import Listener from "../../struct/Listener";
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
		return this.client.sendToLogChannel(oldMessage.guild, "message", {
			embeds: [
				new MessageEmbed({
					title: "Message Edited",
					description: `[Jump to Message!](${oldMessage.url} "Jump to Message")`,
					thumbnail: {
						url: oldMessage.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					footer: {},
					fields: [
						{
							name: "Before",
							value: _oldmessage,
						},
						{
							name: "After",
							value: _newmessage,
						},
						{
							name: "Author",
							value: oldMessage.author.toString(),
							inline: true,
						},
						{
							name: "Channel",
							value: oldMessage.channel.toString(),
							inline: true,
						},
					],
				}),
			],
		});
	}
}
