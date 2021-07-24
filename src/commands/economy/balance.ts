import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class BalanceCommand extends Command {
	constructor() {
		super("balance", {
			aliases: ["balance", "bal"],
			description: "Check bot latency",
			category: "Economy",
			args: [
				{
					id: "member",
					type: "member",
					default: (message: Message) => message.member,
				},
			],
		});
	}

	async exec(message: Message, args: any) {
		const coins = this.client.members.get(args.member.id, "coins", 0);

		message.channel.send(
			`**Your Current Balance:** ${coins} Coins ${this.client.emoji.coin}`
		);
	}
}
