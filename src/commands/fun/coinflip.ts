import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class CoinflipCommand extends Command {
	constructor() {
		super("coinflip", {
			aliases: ["coinflip", "flip", "flipacoin", "flipcoin"],
			description: "Flips a coin",
			category: "Fun",
		});
	}

	async exec(message: Message) {
		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Coin Flip",
						description: `I Flipped a coin, it was **${
							Math.random() < 0.5 ? "Heads" : "Tails"
						}**!`,
					},
					message,
				),
			],
		});
	}
}
