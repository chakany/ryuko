import { MessageEmbed, Message } from "discord.js";
import { Command } from "discord-akairo";

export default function Error(
	message: Message,
	command: Command,
	error: string,
	description: string
) {
	const prefix = message.util?.parsed?.prefix;
	let current;
	let usage: string = `${prefix}${command.id}`;
	for (let i = 0; (current = command.args[i]); i++) {
		usage = usage + ` <${current.id}>`;
	}
	return new MessageEmbed({
		title: ":x:Error: `" + command.id + "`",
		description: "```diff\n- " + error + "\n+ " + description + "```",
		color: 16716032,
		timestamp: new Date(),
		author: {
			name: message.author.tag,
			icon_url: message.author.avatarURL({ dynamic: true }),
		},
		footer: {
			text: message.client.user?.tag,
			icon_url: message.client.user?.avatarURL({ dynamic: true }),
		},
		fields: [
			{
				name: "Usage",
				value: "`" + usage + "`",
			},
		],
	});
}
