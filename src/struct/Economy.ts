import path from "path";
import Db from "../utils/db";
import { Op } from "sequelize";
import { Snowflake } from "discord.js";

interface Item {
	name: string;
	cost: number;
}

export default class Economy {
	private dir: string;
	private db: Db;

	constructor(dir: string, db: Db) {
		this.dir = path.resolve(__dirname, dir);
		this.db = db;
	}

	getItems(guildId: Snowflake) {
		return this.db.items.findAll({
			where: {
				guildId,
			},
		});
	}

	getGuild(guildId: Snowflake) {
		return this.db.guildBalances.findAll({
			where: {
				guildId,
			},
			order: [["coins", "DESC"]],
		});
	}

	createTransaction(
		guildId: Snowflake,
		senderId: Snowflake,
		recieverId: Snowflake,
		amount: number,
		reason = ""
	) {
		return this.db.transactions.create({
			guildId,
			sender: senderId,
			reciever: recieverId,
			amount,
			reason,
		});
	}

	getTransactions(guildId: Snowflake, memberId: Snowflake) {
		return this.db.transactions.findAll({
			where: {
				[Op.or]: [{ sender: memberId }, { reciever: memberId }],
				guildId,
			},
			order: [["createdAt", "DESC"]],
		});
	}

	getBalance(guildId: Snowflake, memberId: Snowflake) {
		return this.db.guildBalances.findOne({
			attributes: ["coins"],
			where: {
				guildId,
				memberId,
			},
		});
	}

	async addCoins(guildId: Snowflake, memberId: Snowflake, amount: number) {
		const grabbedBalance = await this.db.guildBalances.findOne({
			where: {
				guildId,
				memberId,
			},
		});

		if (!grabbedBalance)
			return this.db.guildBalances.create({
				guildId,
				memberId,
				coins: amount,
			});

		return this.db.guildBalances.update(
			{
				coins: grabbedBalance.coins + amount,
			},
			{
				where: {
					guildId,
					memberId,
				},
			}
		);
	}

	async removeCoins(guildId: Snowflake, memberId: Snowflake, amount: number) {
		const grabbedBalance = await this.db.guildBalances.findOne({
			where: {
				guildId,
				memberId,
			},
		});

		if (!grabbedBalance) return null;

		return this.db.guildBalances.update(
			{
				coins: grabbedBalance.coins - amount,
			},
			{
				where: {
					guildId,
					memberId,
				},
			}
		);
	}
}
