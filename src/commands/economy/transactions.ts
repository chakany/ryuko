import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import { FieldsEmbed } from "discord-paginationembed";

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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Transactions",
					"You do not have any transactions!"
				)
			);

		const transactionEmbed = new FieldsEmbed()
			.setArray(transactions)
			.setChannel(<TextChannel>message.channel)
			.setAuthorizedUsers([message.author.id])
			.setElementsPerPage(6)
			.formatField("Transactions", (transaction: any) => {
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
			.setPage(1)
			.setPageIndicator(true);

		transactionEmbed.embed
			.setColor(message.guild!.me!.displayHexColor)
			.setTitle(
				`${this.client.emoji.coin}${message.author.username}'s Transactions`
			)
			.setThumbnail(message.author!.displayAvatarURL({ dynamic: true }))
			.setTimestamp(new Date())
			.setFooter(
				message.author.tag,
				message.author.displayAvatarURL({ dynamic: true })
			);

		await transactionEmbed.build();
	}
}
