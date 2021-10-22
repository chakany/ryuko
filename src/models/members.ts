import { Sequelize, DataTypes, ModelCtor } from "sequelize";

export default function (sequelize: Sequelize, config: any): ModelCtor<any> {
	return sequelize.define("members", {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
			unique: "id",
		},
		cookieId: {
			type: DataTypes.STRING,
		},
		ipAddress: {
			type: DataTypes.STRING,
		},
		verifiedAt: {
			type: DataTypes.DATE,
		},
	});
}
