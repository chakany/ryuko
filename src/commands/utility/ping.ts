import { Command } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";

export default class PingCommand extends Command {
	constructor() {
		super("ping", {
			aliases: ["ping"],
			description: "Check bot latency",
			category: "Utility",
		});
	}

	async exec(message: Message) {
		return message.channel.send(
			new MessageEmbed({
				title: "Pong!",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				thumbnail: {
					url: "https://media.giphy.com/media/fvA1ieS8rEV8Y/giphy.gif",
				},
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				fields: [
					{
						name: "API Latency",
						value: "`" + `${Math.round(this.client.ws.ping)}ms` + "`",
						inline: true,
					},
				],
			})
		);
	}
}
