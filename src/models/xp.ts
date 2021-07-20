import { Sequelize, DataTypes, ModelCtor } from "sequelize";

export default function (sequelize: Sequelize, config: any): ModelCtor<any> {
	return sequelize.define(
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
}
