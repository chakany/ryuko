import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class PingCommand extends Command {
	constructor() {
		super("ping", {
			aliases: ["ping"],
			description: "Check bot latency",
			category: "Info",
		});
	}

	async exec(message: Message) {
		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Pong!",
						thumbnail: {
							url: "https://media.giphy.com/media/fvA1ieS8rEV8Y/giphy.gif",
						},
						fields: [
							{
								name: "API Latency",
								value:
									"`" +
									`${Math.round(this.client.ws.ping)}ms` +
									"`",
								inline: true,
							},
						],
					},
					message,
				),
			],
		});
	}
}
