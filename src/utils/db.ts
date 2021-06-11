import { Sequelize, DataTypes, QueryTypes, Op } from "sequelize";
import { SequelizeProvider } from "discord-akairo";
import bunyan from "bunyan";

let log = bunyan.createLogger({
	name: "db",
	stream: process.stdout,
	level: "debug",
});

let sequelize: Sequelize;

const { db, prefix } = require("../../config.json");
if (process.env.NODE_ENV !== "production")
	sequelize = new Sequelize(db.database, db.username, db.password, {
		host: db.host,
		dialect: "mariadb",
		port: db.port,
		logging: (msg) => log.debug(msg),
	});
else
	sequelize = new Sequelize(db.database, db.username, db.password, {
		host: db.host,
		dialect: "mariadb",
		port: db.port,
		logging: false,
	});

// Our Models
const guilds = sequelize.define("guilds", {
	id: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
		unique: "id",
	},
	prefix: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: prefix,
	},
	levelUpMessage: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
	},
	volume: {
		type: DataTypes.INTEGER,
		defaultValue: 80,
	},
	modRole: {
		type: DataTypes.STRING,
	},
	muteRole: {
		type: DataTypes.STRING,
	},
	mutedUsers: {
		type: DataTypes.JSON,
	},
	disabledCommands: {
		type: DataTypes.JSON,
	},
	logging: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	loggingChannel: {
		type: DataTypes.STRING,
	},
	verification: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	verificationLevel: {
		type: DataTypes.STRING,
		defaultValue: "low",
	},
	verifiedRole: {
		type: DataTypes.STRING,
	},
	tickets: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	ticketRole: {
		type: DataTypes.STRING,
	},
	ticketCategory: {
		type: DataTypes.STRING,
	},
	someDumbFuckingSetting: {
		type: DataTypes.BOOLEAN,
	},
});

const tickets = sequelize.define(
	"tickets",
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		guildId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "guilds",
				key: "id",
			},
		},
		memberId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "members",
				key: "id",
			},
		},
		channelId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{ paranoid: true }
);

const punishments = sequelize.define("punishments", {
	id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
	},
	guildId: {
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model: "guilds",
			key: "id",
		},
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	memberId: {
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model: "members",
			key: "id",
		},
	},
	adminId: {
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model: "members",
			key: "id",
		},
	},
	unpunished: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	reason: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	expires: {
		type: DataTypes.DATE,
		allowNull: false,
	},
});

const members = sequelize.define("members", {
	id: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
		unique: "id",
	},
	cookieId: {
		type: DataTypes.STRING,
	},
	ipAddress: {
		type: DataTypes.STRING,
	},
	xpMultiplier: {
		type: DataTypes.FLOAT,
		defaultValue: 1.0,
	},
});

const guildXp = sequelize.define(
	"xp",
	{
		memberId: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
			references: {
				model: "members",
				key: "id",
			},
		},
		guildId: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
			references: {
				model: "guilds",
				key: "id",
			},
		},
		level: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
		},
		xp: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	},
	{ freezeTableName: true }
);

export default class Db {
	constructor() {}
	getSettings() {
		return new SequelizeProvider(guilds, {
			idColumn: "id",
		});
	}

	async addTicket(guildId: string, memberId: string, channelId: string) {
		await members.upsert({
			id: memberId,
		});
		return tickets.create({
			guildId,
			memberId,
			channelId,
		});
	}

	findTicket(guildId: string, channelId: string): Promise<any> {
		return tickets.findOne({
			attributes: ["memberId"],
			where: {
				guildId,
				channelId,
			},
		});
	}

	deleteTicket(guildId: string, memberId: string, channelId: string) {
		return tickets.destroy({
			where: {
				guildId,
				memberId,
				channelId,
			},
		});
	}

	addMember(id: string, cookieId: string, ipAddress: string) {
		return members.upsert({
			id,
			cookieId,
			ipAddress,
		});
	}

	getMembersByIdentifier(cookieId = "", ipAddress = ""): Promise<any> {
		return members.findOne({
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
				await sequelize
					.query(
						"INSERT IGNORE INTO `members` (`id`,`createdAt`,`updatedAt`) VALUES (:id,NOW(),NOW()) RETURNING *;",
						{
							replacements: {
								id: memberId,
							},
							type: QueryTypes.SELECT,
						}
					)
					.then(async (user) => {
						const multiplier = user[0]
							? // @ts-expect-error
							  <number>user[0].xpMultiplier
							: 1;

						const query = await sequelize.query(
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
						const level = Math.trunc(
							(oldXp - xp * multiplier) / 500
						);

						resolve(
							(xp * multiplier + oldXp) % 500 == 0 ||
								(xp * multiplier + oldXp > level * 500 &&
									xp * multiplier + oldXp <
										(level + 1) * 500 &&
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
			results = await guildXp.findOne({
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
			const results: any[] = await guildXp.findAll({
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
		return await punishments.findAll({
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
		return punishments.findOne({
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
			await members.upsert({
				id: memberId,
			});

			await punishments.create({
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
		return await punishments.update(
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

	async sync() {
		try {
			sequelize.sync({ alter: true });
		} catch (error) {
			throw new Error(error);
		}
	}
}
