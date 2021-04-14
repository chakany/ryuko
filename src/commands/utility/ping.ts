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
				color: 16716032,
				timestamp: new Date(),
				thumbnail: {
					url: "https://media.giphy.com/media/fvA1ieS8rEV8Y/giphy.gif",
				},
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: message.client.user?.tag,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
				fields: [
					{
						name: "Latency",
						value: `${Date.now() - message.createdTimestamp}ms`,
						inline: true,
					},
					{
						name: "API Latency",
						value: `${Math.round(this.client.ws.ping)}ms`,
						inline: true,
					},
				],
			})
		);
	}
}
