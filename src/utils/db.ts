import { Sequelize, DataTypes, QueryTypes, Op, ModelCtor } from "sequelize";
import { Snowflake } from "discord.js";
import { SequelizeProvider } from "@ryukobot/discord-akairo";
import bunyan from "bunyan";

import guildsModel from "../models/guilds";
import ticketsModel from "../models/tickets";
import punishmentsModel from "../models/punishments";
import membersModel from "../models/members";
import transactionsModel from "../models/transactions";
import filteredPhrasesModel from "../models/filteredPhrases";
import guildBalancesModel from "../models/guildBalances";
import itemsModel from "../models/items";

const config = require("../../config.json");

let log = bunyan.createLogger({
	name: "db",
	stream: process.stdout,
	level: process.env.NODE_ENV !== "production" ? "debug" : "info",
});

export default class Db extends Sequelize {
	public guilds: ModelCtor<any>;
	public tickets: ModelCtor<any>;
	public punishments: ModelCtor<any>;
	public members: ModelCtor<any>;
	public transactions: ModelCtor<any>;
	public filteredPhrases: ModelCtor<any>;
	public guildBalances: ModelCtor<any>;
	public items: ModelCtor<any>;

	constructor() {
		super(config.db.database, config.db.username, config.db.password, {
			host: config.db.host,
			dialect: "mariadb",
			port: config.db.port,
			logging: (msg) => log.debug(msg),
		});

		this.guilds = guildsModel(this, config);
		this.tickets = ticketsModel(this, config);
		this.punishments = punishmentsModel(this, config);
		this.members = membersModel(this, config);
		this.transactions = transactionsModel(this, config);
		this.filteredPhrases = filteredPhrasesModel(this);
		this.guildBalances = guildBalancesModel(this);
		this.items = itemsModel(this);
	}

	getSettings() {
		return new SequelizeProvider(this.guilds, {
			idColumn: "id",
		});
	}

	getMember(id: string) {
		return this.members.findOne({
			where: {
				id,
			},
		});
	}

	async addTicket(guildId: string, memberId: string, channelId: string) {
		await this.members.upsert({
			id: memberId,
		});
		return this.tickets.create({
			guildId,
			memberId,
			channelId,
		});
	}

	findTicket(guildId: string, channelId: string): Promise<any> {
		return this.tickets.findOne({
			attributes: ["memberId"],
			where: {
				guildId,
				channelId,
			},
		});
	}

	deleteTicket(guildId: string, memberId: string, channelId: string) {
		return this.tickets.destroy({
			where: {
				guildId,
				memberId,
				channelId,
			},
		});
	}

	addMember(id: string, cookieId: string, ipAddress: string) {
		return this.members.upsert({
			id,
			cookieId,
			ipAddress,
			verifiedAt: new Date(),
		});
	}

	getMembersByIdentifier(cookieId = "", ipAddress = ""): Promise<any> {
		return this.members.findOne({
			attributes: ["id", "ipAddress", "cookieId", "verifiedAt"],
			where: {
				[Op.or]: [{ cookieId }, { ipAddress }],
			},
		});
	}

	async getCurrentUserPunishments(
		memberId: string,
		guildId: string
	): Promise<any[]> {
		return await this.punishments.findAll({
			where: {
				memberId,
				guildId,
				unpunished: false,
				expires: {
					[Op.gte]: new Date(),
				},
			},
		});
	}

	async getCurrentUserMutes(memberId: string, guildId: string): Promise<any> {
		return this.punishments.findOne({
			where: {
				memberId,
				guildId,
				type: "mute",
				unpunished: false,
				expires: {
					[Op.gte]: new Date(),
				},
			},
		});
	}

	async getAllMutes(memberId: string, guildId: string): Promise<any> {
		return this.punishments.findAll({
			where: {
				memberId,
				guildId,
				type: "mute",
			},
			order: [["createdAt", "DESC"]],
		});
	}

	warnMember(
		memberId: string,
		guildId: string,
		adminId: string,
		reason = ""
	): Promise<any> {
		return this.punishments.create({
			memberId,
			guildId,
			type: "warn",
			adminId,
			reason,
		});
	}

	getAllWarns(memberId: string, guildId: string): Promise<any> {
		return this.punishments.findAll({
			where: {
				memberId,
				guildId,
				type: "warn",
			},
			order: [["createdAt", "DESC"]],
		});
	}

	async hasPhrase(guildId: string, phrase: string): Promise<boolean> {
		const found = await this.filteredPhrases.findOne({
			where: {
				guildId,
				phrase,
			},
		});

		if (found && found.phrase == phrase) return true;
		else return false;
	}

	addPhrase(guildId: string, phrase: string): Promise<any> {
		return this.filteredPhrases.create({
			guildId,
			phrase,
		});
	}

	removePhrase(guildId: string, phrase: string): Promise<any> {
		return this.filteredPhrases.destroy({
			where: {
				guildId,
				phrase,
			},
		});
	}

	getFilteredPhrases(guildId: string): Promise<any> {
		return this.filteredPhrases.findAll({
			where: {
				guildId,
			},
		});
	}

	async muteUser(
		guildId: string,
		type: string,
		memberId: string,
		adminId: string,
		reason: string,
		expires: Date
	) {
		try {
			await this.members.upsert({
				id: memberId,
			});

			await this.punishments.create({
				guildId,
				type,
				memberId,
				adminId,
				reason,
				expires,
			});

			return true;
		} catch (err) {
			log.error(err);
			throw err;
		}
	}

	async unpunishMember(
		memberId: string,
		guildId: string,
		type: string
	): Promise<any[]> {
		return await this.punishments.update(
			{
				unpunished: true,
			},
			{
				where: {
					memberId,
					guildId,
					type,
					unpunished: false,
					expires: {
						[Op.gte]: new Date(),
					},
				},
			}
		);
	}
}
