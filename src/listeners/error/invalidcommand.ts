import Listener from "../../struct/Listener";
import { Message } from "discord.js";
import levenshtein from "fast-levenshtein";

export default class InvalidCommandListener extends Listener {
	constructor() {
		super("invalidCommand", {
			emitter: "commandHandler",
			event: "messageInvalid",
		});
	}

	exec(message: Message) {
		if (
			!message.content.startsWith(
				this.client.settings.get(
					message.guild!.id,
					"prefix",
					this.client.config.prefix,
				),
			) ||
			message.content ==
				this.client.settings.get(
					message.guild!.id,
					"prefix",
					this.client.config.prefix,
				)
		)
			return true;
		// When a non-existent command was ran try to use the levenshtein algorithm to find a close match.
		const distances = [];
		const usableCommands = message.util?.handler.aliases;

		for (const cmd of usableCommands!) {
			distances.push({
				dist: levenshtein.get(cmd[0], message.util!.parsed!.alias!),
				cmd,
			});
		}

		if (!distances || !distances.length) return;

		distances.sort((a, b) => a.dist - b.dist);

		if (distances[0].dist > 0 && distances[0].dist <= 2) {
			const command = this.client.commandHandler.findCommand(
				distances[0].cmd[0],
			);
			return message.channel.send({
				embeds: [
					this.embed(
						{
							title: "Invalid Command",
							description:
								"Did you mean [`" +
								message.util?.parsed?.prefix +
								distances[0].cmd[0] +
								"`" +
								`](${this.client.config.siteUrl}/commands#${command.id}-command)?`,
							author: {
								name: `❌ Error: ${message.util?.parsed?.alias}`,
							},
						},
						message.author,
						message.guild!,
					),
				],
			});
		}
	}
}
