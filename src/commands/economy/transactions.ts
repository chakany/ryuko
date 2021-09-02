import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import PaginationEmbed from "../../utils/PaginationEmbed";

export default class TransactionsCommand extends Command {
	constructor() {
		super("transactions", {
			aliases: ["transactions"],
			description: "See your transaction history",
			category: "Economy",
		});
	}

	async exec(message: Message): Promise<any> {
		const transactions = await this.client.economy.getTransactions(
			message.author.id
		);

		if (!transactions.length)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Transactions",
						"You do not have any transactions!"
					),
				],
			});

		const transactionsEmbed = new PaginationEmbed(message)
			.format((transaction: any) => {
				return transaction.sender == message.author.id
					? `:arrow_right: ${
							!isNaN(transaction.reciever)
								? `<@!${transaction.reciever}>`
								: transaction.reciever
					  }; **${transaction.amount} Coins**; ${
							transaction.reason
								? `\`${transaction.reason}\``
								: "No Reason Provided"
					  }`
					: `:arrow_left: ${
							!isNaN(transaction.sender)
								? `<@!${transaction.sender}>`
								: transaction.sender
					  }; **${transaction.amount} Coins**; ${
							transaction.reason
								? `\`${transaction.reason}\``
								: "No Reason Provided"
					  }`;
			})
			.setFieldName("Transactions")
			.setExpireTime(60000);

		transactionsEmbed.setEmbed({
			title: `${this.client.emoji.coin}${message.author.username}'s Transactions`,
			thumbnail: {
				url: message.author.displayAvatarURL({ dynamic: true }),
			},
		});

		await transactionsEmbed.send(transactions, 6);
	}
}
