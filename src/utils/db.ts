import { Sequelize, Op, ModelCtor } from "sequelize";
import { Snowflake } from "discord.js";
import { SequelizeProvider } from "@ryukobot/discord-akairo";
import bunyan from "bunyan";
import { PunishmentType } from "./db.d";

import guildsModel from "../models/guilds";
import ticketsModel from "../models/tickets";
import punishmentsModel from "../models/punishments";
import membersModel from "../models/members";
import filteredPhrasesModel from "../models/filteredPhrases";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../../config.json");

const log = bunyan.createLogger({
	name: "db",
	stream: process.stdout,
	level: process.env.NODE_ENV !== "production" ? "debug" : "info",
});

export default class Db extends Sequelize {
	public guilds: ModelCtor<any>;
	public tickets: ModelCtor<any>;
	public punishments: ModelCtor<any>;
	public members: ModelCtor<any>;
	public filteredPhrases: ModelCtor<any>;

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
		this.filteredPhrases = filteredPhrasesModel(this);
	}

	getSettings(): SequelizeProvider {
		return new SequelizeProvider(this.guilds, {
			idColumn: "id",
		});
	}

	getMember(id: Snowflake): Promise<any> {
		return this.members.findOne({
			where: {
				id,
			},
		});
	}

	async addTicket(
		guildId: Snowflake,
		memberId: Snowflake,
		channelId: Snowflake,
	): Promise<any> {
		await this.members.upsert({
			id: memberId,
		});

		return this.tickets.create({
			guildId,
			memberId,
			channelId,
		});
	}

	findTicket(guildId: Snowflake, channelId: Snowflake): Promise<any> {
		return this.tickets.findOne({
			attributes: ["memberId"],
			where: {
				guildId,
				channelId,
			},
		});
	}

	deleteTicket(
		guildId: Snowflake,
		memberId: Snowflake,
		channelId: Snowflake,
	): Promise<number> {
		return this.tickets.destroy({
			where: {
				guildId,
				memberId,
				channelId,
			},
		});
	}

	addMember(id: Snowflake): Promise<[any, boolean | null]> {
		return this.members.upsert({
			id,
		});
	}

	verifyMember(
		id: Snowflake,
		cookieId: string,
		ipAddress: string,
	): Promise<[any, boolean | null]> {
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
		memberId: Snowflake,
		guildId: Snowflake,
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

	getCurrentUserMutes(memberId: Snowflake, guildId: Snowflake): Promise<any> {
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

	getAllMutes(memberId: Snowflake, guildId: Snowflake): Promise<any[]> {
		return this.punishments.findAll({
			where: {
				memberId,
				guildId,
				type: "mute",
			},
			order: [["createdAt", "DESC"]],
		});
	}

	getAllWarns(memberId: Snowflake, guildId: Snowflake): Promise<any[]> {
		return this.punishments.findAll({
			where: {
				memberId,
				guildId,
				type: "warn",
			},
			order: [["createdAt", "DESC"]],
		});
	}

	async hasPhrase(guildId: Snowflake, phrase: string): Promise<boolean> {
		const found = await this.filteredPhrases.findOne({
			where: {
				guildId,
				phrase,
			},
		});

		if (found && found.phrase == phrase) return true;
		else return false;
	}

	addPhrase(guildId: Snowflake, phrase: string): Promise<any> {
		return this.filteredPhrases.create({
			guildId,
			phrase,
		});
	}

	removePhrase(guildId: Snowflake, phrase: string): Promise<number> {
		return this.filteredPhrases.destroy({
			where: {
				guildId,
				phrase,
			},
		});
	}

	getFilteredPhrases(guildId: Snowflake): Promise<any[]> {
		return this.filteredPhrases.findAll({
			where: {
				guildId,
			},
		});
	}

	async addPunishment(
		guildId: Snowflake,
		type: PunishmentType,
		memberId: Snowflake,
		adminId: Snowflake,
		reason: string,
		expires?: Date,
	): Promise<any> {
		await this.members.upsert({
			id: memberId,
		});

		return this.punishments.create({
			guildId,
			type,
			memberId,
			adminId,
			reason,
			expires,
		});
	}

	unpunishMember(
		memberId: Snowflake,
		guildId: Snowflake,
		type: PunishmentType,
	): Promise<[number, any[]]> {
		return this.punishments.update(
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
			},
		);
	}
}
