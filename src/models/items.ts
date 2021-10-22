import { Sequelize, DataTypes, ModelCtor } from "sequelize";

export default function (sequelize: Sequelize): ModelCtor<any> {
	return sequelize.define("items", {
		guildId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "guilds",
				key: "id",
			},
		},
		roleId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	});
}
