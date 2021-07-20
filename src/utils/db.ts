import { Sequelize, DataTypes, QueryTypes, Op, ModelCtor } from "sequelize";
import { SequelizeProvider } from "discord-akairo";
import bunyan from "bunyan";

import guildsModel from "../models/guilds";
import ticketsModel from "../models/tickets";
import punishmentsModel from "../models/punishments";
import membersModel from "../models/members";
import xpModel from "../models/xp";

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
	public guildXp: ModelCtor<any>;

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
		this.guildXp = xpModel(this, config);
	}

	getSettings() {
		return new SequelizeProvider(this.guilds, {
			idColumn: "id",
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
		});
	}

	getMembersByIdentifier(cookieId = "", ipAddress = ""): Promise<any> {
		return this.members.findOne({
			attributes: ["id", "ipAddress", "cookieId", "updatedAt"],
			where: {
				[Op.or]: [{ cookieId }, { ipAddress }],
			},
		});
	}

	async addXp(
		memberId: string,
		guildId: string,
		xp: number
	): Promise<number | boolean> {
		return new Promise(async (resolve, reject) => {
			try {
				await this.query(
					"INSERT IGNORE INTO `members` (`id`,`createdAt`,`updatedAt`) VALUES (:id,NOW(),NOW()) RETURNING *;",
					{
						replacements: {
							id: memberId,
						},
						type: QueryTypes.SELECT,
					}
				).then(async (user) => {
					const multiplier = user[0]
						? // @ts-expect-error
						  <number>user[0].xpMultiplier
						: 1;

					const query = await this.query(
						"INSERT INTO `xp` (`memberId`,`guildId`,`level`,`xp`,`createdAt`,`updatedAt`) VALUES (:memberId,:guildId,TRUNCATE(:xp / 500, 0) + 1,:xp,NOW(),NOW()) ON DUPLICATE KEY UPDATE `memberId`=VALUES(`memberId`), `guildId`=VALUES(`guildId`), `xp`=xp + (VALUES(`xp`) * :multiplier), `level`=TRUNCATE(xp / 500, 0) + 1, `updatedAt`=VALUES(`updatedAt`) RETURNING *;",
						{
							replacements: {
								memberId,
								guildId,
								xp,
								multiplier,
							},
							type: QueryTypes.SELECT,
						}
					);
					// @ts-expect-error
					const oldXp = query[0].xp - xp * multiplier;
					const level = Math.trunc((oldXp - xp * multiplier) / 500);

					resolve(
						(xp * multiplier + oldXp) % 500 == 0 ||
							(xp * multiplier + oldXp > level * 500 &&
								xp * multiplier + oldXp < (level + 1) * 500 &&
								oldXp < level * 500)
							? // @ts-expect-error
							  query[0].level
							: false
					);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	async getMemberXp(memberId: string, guildId: string): Promise<any> {
		let results: any;

		try {
			results = await this.guildXp.findOne({
				where: {
					memberId,
					guildId,
				},
			});
		} catch (error) {
			log.error(error);
		}

		return results;
	}

	async getGuildXp(guildId: string): Promise<any> {
		try {
			const results: any[] = await this.guildXp.findAll({
				where: {
					guildId,
				},
			});

			return results?.sort((a, b) => b.xp - a.xp);
		} catch (error) {
			throw new Error(error);
		}
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
