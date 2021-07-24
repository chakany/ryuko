import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class BalanceCommand extends Command {
	constructor() {
		super("balance", {
			aliases: ["balance", "bal"],
			description: "Check the balance of you or another user",
			category: "Economy",
			args: [
				{
					id: "user",
					type: "user",
					default: (message: Message) => message.author,
				},
			],
		});
	}

	async exec(message: Message, args: any) {
		const coins = await this.client.db.getBalance(args.user.id)

		message.channel.send(
			`**Your Current Balance:** ${coins.coins} Coins ${this.client.emoji.coin}`
		);
	}
}
