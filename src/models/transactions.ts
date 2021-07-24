import { Sequelize, DataTypes, ModelCtor } from "sequelize";

export default function (sequelize: Sequelize, config: any): ModelCtor<any> {
	return sequelize.define("transactions", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: "id",
			allowNull: false,
		},
		sender: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		reciever: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		amount: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		reason: {
			type: DataTypes.STRING,
		},
	});
}
