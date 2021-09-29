import driver from "ioredis";
import bunyan from "bunyan";
import { Snowflake } from "discord.js";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { redis } = require("../../config.json");

export default class Redis extends driver {
	private log: bunyan;

	constructor() {
		super(redis);

		this.log = bunyan.createLogger({ name: "redis" });
	}

	addNewVerification(
		guildId: Snowflake,
		userId: Snowflake,
		level: "low" | "medium" | "strict",
		key: string,
	): Promise<[Error | null, any][]> {
		return this.pipeline()
			.hmset(`verification:${key}`, {
				guildId,
				userId,
				level,
			})
			.expire(`verification:${key}`, 600)
			.exec();
	}

	getVerificationKey(key: string): Promise<Record<string, string>> {
		return this.hgetall(`verification:${key}`);
	}

	removeVerification(key: string): Promise<number> {
		return this.del(`verification:${key}`);
	}
}
