import { Sequelize, Model, DataTypes } from "sequelize";
import { SequelizeProvider } from "discord-akairo";
import axios from "axios";

const { db, prefix } = require("../config.json");

const sequelize = new Sequelize(db.database, db.username, db.password, {
	host: db.host,
	dialect: "mariadb",
	logging: console.log,
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
			console.error(err);
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
			console.error(err);
			throw err;
		}
	}

	async sync() {
		await guild.sync({ alter: true });
		await linked.sync({ alter: true });
	}
})();
