import { Sequelize, DataTypes, ModelCtor } from "sequelize";

export default function (sequelize: Sequelize): ModelCtor<any> {
	return sequelize.define("guildBalances", {
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
		coins: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	});
}
