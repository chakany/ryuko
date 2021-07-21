import { Sequelize, DataTypes, ModelCtor } from "sequelize";

export default function (sequelize: Sequelize, config: any): ModelCtor<any> {
	return sequelize.define(
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
}
