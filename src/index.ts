import { ShardingManager } from "discord.js";
import bunyan from "bunyan";
import express from "express";
import colors from "colors";
import table from "cli-table";
import axios from "axios";
import nekos from "nekos.life";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import Db from "./utils/db";
import Redis from "./utils/redis";
import home from "./routes/home";
import commands from "./routes/commands";
import verify from "./routes/verify";

const { token, port, imgApiUrl, pterodactyl } = require("../config.json");
let log = bunyan.createLogger({ name: "shardmanager" });
let weblog = bunyan.createLogger({ name: "webserver" });
let redislog = bunyan.createLogger({ name: "redis" });

let manager: ShardingManager;
let redis: Redis;

// make this async because so steps are performed in order
void (async function () {
	let shardArgs: string[] = [];

	// Pre-Initialization Checks
	const db = new Db();
	let checkStatus = new table({
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
	if (process.env.NODE_ENV == "production") {
		log.info("Running pre-initialization checks");

		// db check
		try {
			await db.sync();
			checkStatus.push({ db: colors.green("Passed") });
		} catch (error) {
			checkStatus.push({ db: colors.red("Failed") });
			dberror = error;
		}

		// redis check
		await new Promise((resolve) => {
			redis = new Redis(redislog);
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

		// image api check
		if (imgApiUrl !== "")
			try {
				await axios.get(imgApiUrl + "/ping");
				checkStatus.push({ "img-api": colors.green("Passed") });
			} catch (error) {
				shardArgs.push("--disable-Images");
				checkStatus.push({ "img-api": colors.red("Failed") });
			}
		else {
			shardArgs.push("--disable-Images");
			checkStatus.push({ "img-api": colors.yellow("Skipped") });
		}

		// pterodactyl panel check
		if (pterodactyl.url && pterodactyl.key)
			try {
				await axios.get(pterodactyl.url + `/api/client/`, {
					headers: {
						Authorization: `Bearer ${pterodactyl.key}`,
						"Content-Type": "application/json",
						Accept: "Application/vnd.pterodactyl.v1+json",
					},
				});
				checkStatus.push({ pterodactyl: colors.green("Passed") });
			} catch (error) {
				shardArgs.push("--disable-panel");
				checkStatus.push({ pterodactyl: colors.red("Failed") });
			}
		else {
			shardArgs.push("--disable-panel");
			checkStatus.push({ pterodactyl: colors.yellow("Skipped") });
		}

		// nekos.life api check
		try {
			const hentai = new nekos();
			await hentai.sfw.neko();
			checkStatus.push({ "nekos.life": colors.green("Passed") });
		} catch (error) {
			shardArgs.push("--disable-NSFW");
			checkStatus.push({ "nekos.life": colors.red("Failed") });
		}
		console.log(checkStatus.toString());
	} else {
		log.warn(
			"Skipping pre-initialization checks; NODE_ENV is not 'production'"
		);
		checkStatus.push({
			db: colors.yellow("Skipped"),
		});
		checkStatus.push({
			redis: colors.yellow("Skipped"),
		});
		checkStatus.push({ "img-api": colors.yellow("Skipped") });
		checkStatus.push({ pterodactyl: colors.yellow("Skipped") });
		checkStatus.push({ "nekos.life": colors.yellow("Skipped") });
		console.log(checkStatus.toString());
		try {
			await db.sync();
		} catch (error) {
			dberror = error;
		}
		// redis check
		await new Promise((resolve) => {
			redis = new Redis(redislog);
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

	if (process.env.NODE_ENV !== "production")
		manager = new ShardingManager("./bot.ts", {
			token: token,
			execArgv: ["-r", "ts-node/register"],
			shardArgs,
		});
	else
		manager = new ShardingManager("./bot.js", {
			token: token,
			shardArgs,
		});

	manager.on("shardCreate", (shard) => {
		log.info(`Launched shard ${shard.id}`);
		if (shard.id == 0) {
			shard.once("ready", () => {
				const app = express();

				try {
					app.set("view engine", "ejs");
					app.set("views", "../app/pages");
					app.use(bodyParser.urlencoded({ extended: true }));
					app.use(bodyParser.json());
					app.use(cookieParser());

					app.use("/", home);
					app.use("/commands", commands);
					app.use("/verify", verify);

					app.use(express.static("../app/static"));

					app.listen(port, () => {
						weblog.info(`Bound to port ${port}`);
					});
				} catch (error) {
					weblog.error(error);
				}
			});
		}
	});
	manager.spawn();
})();

export { manager, weblog, redis };
