import { Listener, AkairoClient } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class MessageEditListener extends Listener {
	client: AkairoClient;

	constructor(client: AkairoClient) {
		super("messageUpdate", {
			emitter: "client",
			event: "messageUpdate",
		});

		this.client = client;
	}

	async exec(oldMessage: Message, newMessage: Message) {
		if (oldMessage.partial) await oldMessage.fetch();
		if (newMessage.partial) await newMessage.fetch();
		if (oldMessage.content === newMessage.content) return;
		// @ts-expect-error
		if (this.client.commandHandler.handleEdits)
			// @ts-expect-error
			this.client.commandHandler.handle(newMessage);

		if (oldMessage.content === newMessage.content) return;
		if (!oldMessage.guild) return;
		if (oldMessage.author.tag === "GitHub#0000") return;
		const logChannel = this.client.settings.get(
			oldMessage.guild.id,
			"loggingChannel",
			"None"
		);
		if (logChannel === "None") return;
		if (oldMessage.author.bot) return;

		let _newmessage =
			newMessage.content.length > 900
				? newMessage.content.substr(0, 600) + "..."
				: newMessage.content;
		let _oldmessage =
			oldMessage.content.length > 900
				? oldMessage.content.substr(0, 600) + "..."
				: oldMessage.content;

		return (
			// @ts-ignore
			this.client.channels.cache
				.get(logChannel)
				// @ts-ignore
				.send(
					new MessageEmbed({
						title: "Message Edited",
						url: newMessage.url,
						description:
							"```diff" +
							`\n- "${_oldmessage}"` +
							`\n+ "${_newmessage}"` +
							"\n```",
						color: 16716032,
						timestamp: new Date(),
						author: {
							name: oldMessage.author.tag + " (" + oldMessage.author.id + ")",
							icon_url: oldMessage.author.avatarURL({ dynamic: true }) || "",
						},
						footer: {
							text: `No content ("") means that there was probably an embed there\n${oldMessage.client.user?.tag}`,
							icon_url:
								oldMessage.client.user?.avatarURL({ dynamic: true }) || "",
						},
					})
				)
		);
	}
}
