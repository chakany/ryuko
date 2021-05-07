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
	// @ts-ignore
	if (command.args)
		// @ts-ignore
		for (let i = 0; (current = command.args[i]); i++) {
			usage = usage + ` <${current.id}>`;
		}
	return new MessageEmbed({
		title: ":x:Error: `" + command.id + "`",
		description: "```diff\n- " + error + "\n+ " + description + "```",
		color: message.guild?.me?.displayHexColor,
		timestamp: new Date(),
		footer: {
			text: message.author.tag,
			icon_url: message.author.displayAvatarURL({ dynamic: true }),
		},
		fields: [
			{
				name: "Usage",
				value: "`" + usage + "`",
			},
		],
	});
}
