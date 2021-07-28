import path from "path";
import Db from "./db";
import { Op } from "sequelize";

interface Item {
	name: string;
	cost: number;
}

export default class Economy {
	private dir: string;
	private db: Db;
	public items: Item[];

	constructor(dir: string, db: Db) {
		this.dir = path.resolve(__dirname, dir);
		this.db = db;

		this.items = require(path.join(dir, "items.json"));
	}

	createTransaction(
		sender: string,
		reciever: string,
		amount: number,
		reason = ""
	) {
		return this.db.transactions.create({
			sender,
			reciever,
			amount,
			reason,
		});
	}

	getTransactions(id: string) {
		return this.db.transactions.findAll({
			where: {
				[Op.or]: [{ sender: id }, { reciever: id }],
			},
			order: [["createdAt", "DESC"]],
		});
	}

	getBalance(id: string) {
		return this.db.members.findOne({
			attributes: ["coins"],
			where: {
				id,
			},
		});
	}

	addCoins(id: string, amount: number) {
		return this.db.members.update(
			{
				coins: this.db.Sequelize.literal(`coins + ${amount}`),
			},
			{
				where: {
					id,
				},
			}
		);
	}

	removeCoins(id: string, amount: number) {
		return this.db.members.update(
			{
				coins: this.db.Sequelize.literal(`coins - ${amount}`),
			},
			{
				where: {
					id,
				},
			}
		);
	}
}
