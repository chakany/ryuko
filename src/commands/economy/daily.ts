import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class DailyCommand extends Command {
	constructor() {
		super("daily", {
			aliases: ["daily"],
			description: "Get daily coins!",
			category: "Economy",
			cooldown: 8.64e7,
		});
	}

	async exec(message: Message) {
		const amount = Math.floor(Math.random() * 500);

		this.client.economy.addCoins(message.author.id, amount);
		this.client.economy.createTransaction(
			"Daily",
			message.author.id,
			amount,
			"Daily Command"
		);

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Daily",
						description: `Here are your daily **${amount} Coins**! ${this.client.emoji.coin}`,
					},
					message
				),
			],
		});
	}
}
