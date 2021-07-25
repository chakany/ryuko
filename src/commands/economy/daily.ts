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

		return message.channel.send(
			new MessageEmbed({
				title: "Daily",
				description: `Here are your daily **${amount} Coins**! ${this.client.emoji.coin}`,
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
