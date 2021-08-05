import { Sequelize, DataTypes, ModelCtor } from "sequelize";

export default function (sequelize: Sequelize): ModelCtor<any> {
	return sequelize.define("filteredPhrases", {
		guildId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "guilds",
				key: "id",
			},
		},
		phrase: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
}
