import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class CoinflipCommand extends Command {
	constructor() {
		super("coinflip", {
			aliases: ["coinflip", "flip", "flipacoin", "flipcoin"],
			description: "Flips a coin",
			category: "Fun",
		});
	}

	async exec(message: Message) {
		return message.channel.send(
			new MessageEmbed({
				title: "Coin Flip",
				description: `I Flipped a coin, it was **${
					Math.random() < 0.5 ? "Heads" : "Tails"
				}**!`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			})
		);
	}
}
