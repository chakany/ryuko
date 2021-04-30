import { Sequelize, Model, DataTypes } from "sequelize";
import { SequelizeProvider } from "discord-akairo";
import axios from "axios";
import bunyan from "bunyan";
let log = bunyan.createLogger({
	name: "db",
	stream: process.stdout,
	level: "debug",
});

let sequelize;

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
const linked = sequelize.define(
	"linked",
	{
		mc: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: "mc",
		},
		discord: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: "discord",
		},
	},
	{
		freezeTableName: true,
	}
);

const guild = sequelize.define("guild", {
	id: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
	},
	prefix: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: prefix,
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

export default new (class Db {
	getSettings() {
		return new SequelizeProvider(guild, {
			idColumn: "id",
		});
	}

	async checkLinkedUser(id: string) {
		try {
			const account: any = (
				await linked.findAll({
					where: {
						discord: id,
					},
				})
			).map((el) => el.get({ plain: true }));
			if (!account[0]) return false;

			return true;
		} catch (err) {
			log.error(err);
			throw err;
		}
	}

	async linkUser(id: string, mcUser: string) {
		try {
			const uuid = await axios.get(
				`https://api.mojang.com/users/profiles/minecraft/${mcUser}`
			);
			await linked.create({
				mc: uuid.data.id,
				discord: id,
			});

			return true;
		} catch (err) {
			log.error(err);
			throw err;
		}
	}

	async getMutedUsers() {
		let guilds = new Map();

		const dbGuilds = (await guild.findAll()).map((el) =>
			el.get({ plain: true })
		);

		dbGuilds.forEach((guild) => {
			if (guild.mutedUsers) guilds.set(guild.id, guild.mutedUsers);
		});

		return guilds;
	}

	async sync() {
		log.info("Syncing");
		await guild.sync({ alter: true });
		await linked.sync({ alter: true });
	}
})();
