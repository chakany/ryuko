import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class SendCommand extends Command {
	constructor() {
		super("send", {
			aliases: ["send", "gift"],
			description: "Send coins to another user",
			category: "Economy",
			args: [
				{
					id: "user",
					type: "user",
				},
				{
					id: "amount",
					type: "number",
				},
				{
					id: "reason",
					type: "string",
					default: null,
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.user)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide a user to send coins to!"
				)
			);
		if (!args.amount)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide an amount of coins to send!"
				)
			);

		if (message.author.id == args.user.id)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You cannot send coins to yourself!"
				)
			);
		// Get Coins for the executor
		const executor = await this.client.economy.getBalance(
			message.author.id
		);

		// Check if we have enough coins for this transaction
		if (executor.coins < args.amount)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Insufficient Balance",
					`You need ${
						args.amount - executor.coins
					} more coins to perform this transaction!`
				)
			);

		// Update user balances accordingly
		this.client.economy.addCoins(args.user.id, args.amount);
		this.client.economy.removeCoins(message.author.id, args.amount);
		this.client.economy.createTransaction(
			message.author.id,
			args.user.id,
			args.amount,
			args.reason
		);

		return message.channel.send(
			new MessageEmbed({
				title: `${this.client.emoji.coin}Coins Sent!`,
				description: `You sent **${args.amount} coins** to ${args.user}`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				fields: [
					{
						name: "Balance Before",
						value: `**${executor.coins} Coins**`,
						inline: true,
					},
					{
						name: "Balance After",
						value: `**${executor.coins - args.amount} Coins**`,
						inline: true,
					},
				],
			})
		);
	}
}
