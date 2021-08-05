import { Sequelize, DataTypes, ModelCtor } from "sequelize";

export default function (sequelize: Sequelize, config: any): ModelCtor<any> {
	return sequelize.define("guilds", {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
			unique: "id",
		},
		prefix: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: config.prefix,
		},
		levelUpMessage: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
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
		starboard: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		starboardChannel: {
			type: DataTypes.STRING,
		},
		filter: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		someDumbFuckingSetting: {
			type: DataTypes.BOOLEAN,
		},
	});
}
