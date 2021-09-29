import { ShardingManager } from "discord.js";
import Logger from "./struct/Logger";
import colors from "colors";
import table from "cli-table";
import { AutoPoster } from "topgg-autoposter";
import path from "path";
import Db from "./utils/db";
import Redis from "./utils/redis";
import * as Web from "./web";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { token, topgg_token } = require("../config.json");
const log = new Logger({ name: "manager" });

const production = process.env.NODE_ENV === "production";

let manager: ShardingManager;
let redis: Redis;

// make this async because so steps are performed in order
void (async function () {
	const shardArgs: string[] = [];

	// Pre-Initialization Checks
	const db = new Db();
	const checkStatus = new table({
		head: ["Check", "Status"],
		chars: {
			top: "═",
			"top-mid": "╤",
			"top-left": "╔",
			"top-right": "╗",
			bottom: "═",
			"bottom-mid": "╧",
			"bottom-left": "╚",
			"bottom-right": "╝",
			left: "║",
			"left-mid": "╟",
			mid: "─",
			"mid-mid": "┼",
			right: "║",
			"right-mid": "╢",
			middle: "│",
		},
	});
	let dberror: any;
	let rediserror: any;
	if (production) {
		log.info("Running pre-initialization checks");

		// db check
		try {
			await db.sync({ alter: true });
			checkStatus.push({ db: colors.green("Passed") });
		} catch (error) {
			checkStatus.push({ db: colors.red("Failed") });
			dberror = error;
		}

		// redis check
		await new Promise((resolve) => {
			redis = new Redis();
			redis.on("error", (err) => {
				if (!rediserror)
					checkStatus.push({ redis: colors.red("Failed") });
				rediserror = err;
				resolve(false);
			});

			redis.on("connect", (err) => {
				checkStatus.push({ redis: colors.green("Passed") });
				resolve(true);
			});
		});

		console.log(checkStatus.toString());
	} else {
		log.warn(
			"Skipping pre-initialization checks; NODE_ENV is not 'production'",
		);
		checkStatus.push({
			db: colors.yellow("Skipped"),
		});
		checkStatus.push({
			redis: colors.yellow("Skipped"),
		});
		console.log(checkStatus.toString());
		try {
			await db.sync({ alter: true });
		} catch (error) {
			dberror = error;
		}
		// redis check
		await new Promise((resolve) => {
			redis = new Redis();
			redis.on("error", (err) => {
				if (!rediserror)
					checkStatus.push({ redis: colors.red("Failed") });
				rediserror = err;
				resolve(false);
			});

			redis.on("connect", (err) => {
				checkStatus.push({ redis: colors.green("Passed") });
				resolve(true);
			});
		});
	}

	if (dberror) {
		log.error("Could not connect to the database!", {
			err: dberror.message,
		});
		process.exit(1);
	}

	if (rediserror) {
		log.error("Could not connect to redis", {
			err: rediserror.message,
		});
		process.exit(1);
	}

	// Initialization
	log.info("Initializing");

	manager = new ShardingManager(
		path.resolve(__dirname, production ? "bot.js" : "bot.ts"),
		{
			token,
			execArgv: production ? undefined : ["-r", "ts-node/register"],
			shardArgs,
		},
	);

	production ? AutoPoster(topgg_token, manager) : null;

	manager.on("shardCreate", async (shard) => {
		log.info(`Launched shard ${shard.id}`);

		if (shard.id == 0) {
			shard.once("ready", async () => {
				Web.start();
			});
		}
	});
	manager.spawn();
})();

export { manager, redis };
