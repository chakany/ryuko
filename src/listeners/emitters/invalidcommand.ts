import { Listener } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import levenshtein from "fast-levenshtein";

export default class InvalidCommandListener extends Listener {
	constructor() {
		super("invalidCommand", {
			emitter: "commandHandler",
			event: "messageInvalid",
		});
	}

	async exec(message: Message) {
		if (!message.content.startsWith(message.util?.parsed?.prefix!))
			return true;
		// When a non-existent command was ran try to use the levenshtein algorithm to find a close match.
		const distances = [];
		const usableCommands = message.util?.handler.aliases;

		for (const cmd of usableCommands!) {
			distances.push({
				dist: levenshtein.get(cmd[0], message.util?.parsed?.alias!),
				cmd,
			});
		}

		if (!distances || !distances.length) return;

		distances.sort((a, b) => a.dist - b.dist);

		if (distances[0].dist > 0 && distances[0].dist <= 2) {
			return message.channel.send(
				new MessageEmbed({
					title: ":x:Error: `" + message.util?.parsed?.alias + "`",
					description:
						"```diff\n- Invalid Command\n+ Did you mean '" +
						message.util?.parsed?.prefix +
						distances[0].cmd[0] +
						"'?```",
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					author: {
						name: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					footer: {
						text: message.client.user?.tag,
						icon_url: message.client.user?.displayAvatarURL({
							dynamic: true,
						}),
					},
				})
			);
		}
	}
}
