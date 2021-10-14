import Listener from "../../struct/Listener";
import { Message } from "discord.js";

export default class MessageEditListener extends Listener {
	constructor() {
		super("messageUpdate", {
			emitter: "client",
			event: "messageUpdate",
		});
	}

	async exec(oldMessage: Message, newMessage: Message) {
		if (oldMessage.content === newMessage.content) return;
		if (this.client.commandHandler.handleEdits)
			this.client.commandHandler.handle(newMessage);
		if (!oldMessage.guild) return;
		if (oldMessage.author.discriminator === "0000") return;

		if (oldMessage.author.bot) return;

		// Concatinate our message content if it is too long
		const _oldmessage =
			oldMessage.content.length > 900
				? oldMessage.content.substr(0, 600) + "..."
				: oldMessage.content;

		const _newmessage =
			newMessage.content.length > 900
				? newMessage.content.substr(0, 600) + "..."
				: newMessage.content;

		return this.client.sendToLogChannel(oldMessage.guild, "message", {
			embeds: [
				this.embed(
					{
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
					},
					oldMessage.author,
					oldMessage.guild,
				),
			],
		});
	}
}
