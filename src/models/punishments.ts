import { Sequelize, DataTypes, ModelCtor } from "sequelize";

export default function (sequelize: Sequelize, config: any): ModelCtor<any> {
	return sequelize.define("punishments", {
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
			allowNull: true,
		},
		expires: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	});
}
