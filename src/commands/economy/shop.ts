import Command from "../../struct/Command";
import { Message, Role } from "discord.js";
import { Argument } from "@ryukobot/discord-akairo";
import PaginationEmbed from "../../utils/PaginationEmbed";

export default class ShopCommand extends Command {
	constructor() {
		super("shop", {
			aliases: ["shop", "store"],
			description: "Buy Things",
			category: "Economy",
			clientPermissions: ["MANAGE_ROLES"],
			args: [
				{
					id: "buy|sell|add|delete",
					type: "string",
					default: "list",
				},
				{
					id: "role|name|price",
					type: Argument.union("role", "integer", "string"),
				},
				{
					id: "role",
					type: "role",
				},
			],
		});
	}

	async exec(message: Message, args: any) {
		const action = args["buy|sell|add|delete"];
		const second = args["role|name|price"];

		const items = await this.client.economy.getItems(message.guild!.id);

		switch (action) {
			case "list":
				const itemsEmbed = new PaginationEmbed(message)
					.format((item: any) => {
						const role = message.guild!.roles.cache.get(
							item.roleId
						);
						const owned = message.member!.roles.cache.has(
							item.roleId
						);

						return `${role?.name} (${role?.toString()}); **${
							item.price > 1
								? `${item.price} Coins`
								: `${item.price} Coin`
						}**${owned ? `; ${this.client.emoji.greenCheck}` : ""}`;
					})
					.setFieldName("Items")
					.setExpireTime(60000);

				itemsEmbed.setEmbed({
					title: `${this.client.emoji.coin}${
						message.guild!.name
					} Item Shop`,
					description: `Run \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} buy <role>\` to buy a role.\nRun \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} sell <role>\` to sell a role that you own.\nRun \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} add <price> <role>\` to add a role to the shop.\nRun \`${message.util?.parsed?.prefix}${message.util?.parsed?.alias} remove <price> <role>\` to remove a role from the shop.`,
					thumbnail: {
						url: message.guild!.iconURL({ dynamic: true }) || "",
					},
				});

				await itemsEmbed.send(items, 10);
				break;
			case "buy":
				let buyRole: Role | undefined;
				const buyItem =
					items.find(
						(i) =>
							message
								.guild!.roles.cache.get(i.roleId)
								?.name.toLowerCase() ==
							second.name.toLowerCase()
					) || items.find((i) => i.roleId == second.id);

				if (typeof second == "string")
					buyRole = message.guild!.roles.cache.get(buyItem.roleId);
				else if (buyItem) buyRole = second;

				if (!buyRole)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"That is not a valid item!"
							),
						],
					});

				if (message.member!.roles.cache.has(buyRole.id))
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"You already own that role!"
							),
						],
					});

				const buyBal = await this.client.economy.getBalance(
					message.guild!.id,
					message.author.id
				);

				if (!buyBal || buyBal?.coins < buyItem.price)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Insufficient Balance",
								`You need **${
									buyItem.price - (buyBal?.coins || 0) > 1
										? `${
												buyItem.price -
												(buyBal?.coins || 0)
										  }** more coins`
										: `${
												buyItem.price -
												(buyBal?.coins || 0)
										  }** more coin`
								} to buy this item!`
							),
						],
					});

				await this.client.economy.removeCoins(
					message.guild!.id,
					message.author.id,
					buyItem.price
				);

				try {
					await message.member!.roles.add(buyRole);
				} catch (error) {
					await this.client.economy.addCoins(
						message.guild!.id,
						message.author.id,
						buyItem.price
					);

					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Permissions",
								"I could not give you this role! Please check the Role Hierarchy!"
							),
						],
					});
				}
				this.client.economy.createTransaction(
					message.guild!.id,
					message.author.id,
					"Shop",
					buyItem.price,
					`Purchased the ${second.name} Item`
				);

				message.channel.send(
					`${this.client.emoji.greenCheck} Purchased **${
						second.name
					}** for **${
						buyItem.price > 1
							? `${buyItem.price} Coins`
							: `${buyItem.price} Coin`
					}** ${this.client.emoji.coin}`
				);
				break;
			case "sell":
				let sellRole: Role | undefined;
				const sellItem =
					items.find(
						(i) =>
							message
								.guild!.roles.cache.get(i.roleId)
								?.name.toLowerCase() ==
							second.name.toLowerCase()
					) || items.find((i) => i.roleId == second.id);

				if (typeof second == "string")
					sellRole = message.guild!.roles.cache.get(sellItem.roleId);
				else if (sellItem) sellRole = second;

				if (!sellRole)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"That is not a valid item!"
							),
						],
					});

				if (!message.member!.roles.cache.has(sellRole.id))
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"You do not own that role!"
							),
						],
					});

				await this.client.economy.addCoins(
					message.guild!.id,
					message.author.id,
					Math.trunc((80 / 100) * sellItem.price)
				);

				try {
					await message.member!.roles.remove(sellRole);
				} catch (error) {
					await this.client.economy.removeCoins(
						message.guild!.id,
						message.author.id,
						Math.trunc((80 / 100) * sellItem.price)
					);

					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Permissions",
								"I could not remove this role! Please check the Role Hierarchy!"
							),
						],
					});
				}

				this.client.economy.createTransaction(
					message.guild!.id,
					"Shop",
					message.author.id,
					Math.trunc((80 / 100) * sellItem.price),
					`Sold the ${second.name} Item`
				);

				message.channel.send(
					`${this.client.emoji.greenCheck} Sold **${
						second.name
					}** for **${
						Math.trunc((80 / 100) * sellItem.price) > 1
							? `${Math.trunc((80 / 100) * sellItem.price)} Coins`
							: `${Math.trunc((80 / 100) * sellItem.price)} Coin`
					}** ${this.client.emoji.coin}`
				);
				break;
			case "add":
				if (!message.member!.permissions.has("MANAGE_ROLES"))
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Permissions",
								"You are missing the MANAGE_ROLES Permission!"
							),
						],
					});

				if (!second || typeof second !== "number")
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"You must enter a price!"
							),
						],
					});

				if (!args.role)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"I could not find that item! If it has spaces in the name then wrap it in quotes."
							),
						],
					});

				if (
					items.find(
						(item) =>
							message
								.guild!.roles.cache.get(item.roleId)
								?.name.toLowerCase() ==
							args.role.name.toLowerCase()
					)
				)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"That item is already in the shop! Remove it first."
							),
						],
					});

				this.client.economy.addItem(
					message.guild!.id,
					args.role.id,
					second
				);

				message.channel.send(
					`${this.client.emoji.greenCheck} Added the Item **${args.role.name}** for **${second} Coins**`
				);
				break;
			case "remove":
				if (!message.member!.permissions.has("MANAGE_ROLES"))
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Permissions",
								"You are missing the MANAGE_ROLES Permission!"
							),
						],
					});

				if (!second)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"You must enter the name of the item to remove!"
							),
						],
					});

				if (typeof second == "string")
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"I could not find that item! If it has spaces in the name then wrap it in quotes."
							),
						],
					});

				if (
					!items.find(
						(item) =>
							message
								.guild!.roles.cache.get(item.roleId)
								?.name.toLowerCase() ==
							second.name.toLowerCase()
					)
				)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Arguments",
								"That item is not in the shop! Add it first."
							),
						],
					});

				this.client.economy.removeItem(
					message.guild!.id,
					second.id,
					items.find(
						(item) =>
							message
								.guild!.roles.cache.get(item.roleId)
								?.name.toLowerCase() ==
							second.name.toLowerCase()
					).price
				);

				message.channel.send(
					`${this.client.emoji.greenCheck} Removed the Item **${second.name}**`
				);
		}
	}
}
