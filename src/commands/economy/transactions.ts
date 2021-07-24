import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import { FieldsEmbed } from "discord-paginationembed";

export default class TransactionsCommand extends Command {
	constructor() {
		super("transactions", {
			aliases: ["transactions"],
			description: "Check the balance of you or another user",
			category: "Economy",
			clientPermissions: ["MANAGE_MESSAGES"],
		});
	}

	async exec(message: Message) {
		const transactions = await this.client.db.getTransactions(
			message.author.id
		);

		const transactionEmbed = new FieldsEmbed()
			.setArray(transactions)
			.setChannel(<TextChannel>message.channel)
			.setAuthorizedUsers([message.author.id])
			.setElementsPerPage(6)
			.formatField("Transactions", (transaction: any) => {
				return `<@!${transaction.reciever}>:arrow_left:<@!${transaction.sender}>; **${transaction.amount} Coins**`;
			})
			.setPage(1)
			.setPageIndicator(true)
			.setDisabledNavigationEmojis(["delete"]);

		transactionEmbed.embed
			.setColor(message.guild!.me!.displayHexColor)
			.setTitle(
				`${this.client.emoji.coin}${message.author.username}'s Transactions`
			)
			.setThumbnail(message.guild!.iconURL({ dynamic: true }) || "")
			.setTimestamp(new Date())
			.setFooter(
				message.author.tag,
				message.author.displayAvatarURL({ dynamic: true })
			);

		await transactionEmbed.build();
	}
}
