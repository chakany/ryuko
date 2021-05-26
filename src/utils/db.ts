import { Sequelize, Model, DataTypes, Op } from "sequelize";
import { SequelizeProvider } from "discord-akairo";
import axios from "axios";
import bunyan from "bunyan";
import { Message } from "discord.js";

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
		defaultValue: 100,
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
	loggingChannel: {
		type: DataTypes.STRING,
	},
});

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
	victimId: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	adminId: {
		type: DataTypes.BIGINT,
		allowNull: false,
		references: {
			model: "users",
			key: "id",
		},
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

const users = sequelize.define("users", {
	id: {
		type: DataTypes.BIGINT,
		allowNull: false,
		primaryKey: true,
		unique: "id",
	},
	level: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
	},
	xp: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
	xpMultiplier: {
		type: DataTypes.FLOAT,
		defaultValue: 1.0,
	},
});

export default class Db {
	constructor() {}
	getSettings() {
		return new SequelizeProvider(guilds, {
			idColumn: "id",
		});
	}

	async addXp(
		id: string,
		xp: number,
		message?: Message
	): Promise<number | boolean> {
		return new Promise(async (resolve, reject) => {
			try {
				await users
					.findAll({
						where: {
							id,
						},
					})
					.then(async (user) => {
						const currentXp = user[0]
							? <number>user[0].get("xp")
							: 0;
						const multiplier = user[0]
							? <number>user[0].get("xpMultiplier")
							: 1;
						let level = user[0] ? <number>user[0].get("level") : 1;

						let leveledUp = false;

						// prettier-ignore
						if (
							(xp * multiplier + currentXp) % 500 == 0 ||
							(xp * multiplier + currentXp > level * 500 &&
								xp * multiplier + currentXp < (level + 1) * 500 &&
								currentXp < level * 500)
						) {
							level = level + 1;
							leveledUp = true;
						}

						await users.upsert({
							id,
							xp: currentXp + xp * multiplier,
							level,
						});
						if (leveledUp) resolve(level);
						else resolve(false);
					});
			} catch (error) {
				log.error(error);
				reject(error);
			}
		});
	}

	async getUserXp(id: string): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				await users
					.findAll({
						where: {
							id,
						},
					})
					.then(async (user) => {
						resolve(user[0]);
					});
			} catch (error) {
				log.error(error);
				reject(error);
			}
		});
	}

	async getMutedUsers() {
		let guilds = new Map();
		const date = new Date();
		const mutes = await sequelize.query(
			"SELECT guildId,victimId,expires,createdAt FROM punishments WHERE NOW() <= expires;"
		);

		return mutes[0];
	}

	async muteUser(
		guildId: string,
		type: string,
		victimId: string,
		adminId: string,
		reason: string,
		expires: Date
	) {
		try {
			await punishments.create({
				guildId,
				type,
				victimId,
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

	async sync() {
		sequelize.sync({ alter: true });
	}
}
