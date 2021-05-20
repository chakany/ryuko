import { ShardingManager } from "discord.js";
import bunyan from "bunyan";
import express from "express";
import colors from "colors";
import table from "cli-table";
import axios from "axios";
import nekos from "nekos.life";
import Db from "./utils/db";
import home from "./routes/home";
import commands from "./routes/commands";

const { token, port, imgApiUrl, pterodactyl } = require("../config.json");
let log = bunyan.createLogger({ name: "shardmanager" });
let weblog = bunyan.createLogger({ name: "webserver" });

let manager: ShardingManager;

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

		// image api check
		try {
			await axios.get(imgApiUrl + "/ping");
			checkStatus.push({ "img-api": colors.green("Passed") });
		} catch (error) {
			shardArgs.push("--disable-Images");
			checkStatus.push({ "img-api": colors.red("Failed") });
		}

		// pterodactyl panel check
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

		// nekos.life api check
		try {
			const hentai = new nekos();
			await hentai.sfw.neko();
			checkStatus.push({ "nekos.life": colors.green("Passed") });
		} catch (error) {
			shardArgs.push("--disable-NSFW");
			checkStatus.push({ imgApi: colors.red("Failed") });
		}
	} else {
		log.warn(
			"Skipping pre-initialization checks; NODE_ENV is not 'production'"
		);
		checkStatus.push({
			db: colors.yellow("Skipped"),
		});
		checkStatus.push({ "img-api": colors.yellow("Skipped") });
		checkStatus.push({ pterodactyl: colors.yellow("Skipped") });
		checkStatus.push({ "nekos.life": colors.yellow("Skipped") });
		await db.sync();
	}

	console.log(checkStatus.toString());

	if (
		checkStatus.find((value) => value.db == colors.red("Failed")) !==
		undefined
	) {
		log.error("Could not connect to the database!", {
			err: dberror.message,
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

	manager.on("shardCreate", (shard) =>
		log.info(`Launched shard ${shard.id}`)
	);
	manager.spawn();

	const app = express();

	try {
		app.set("view engine", "ejs");
		app.set("views", "../app/pages");

		app.use("/", home);
		app.use("/commands", commands);

		app.use(express.static("../app/static"));

		app.listen(port, () => {
			weblog.info(`Bound to port ${port}`);
		});
	} catch (error) {
		weblog.error(error);
	}
})();

export { manager, weblog };
