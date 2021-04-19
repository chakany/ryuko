import { ShardingManager } from "discord.js";
import bunyan from "bunyan";
import db from "./utils/db";
const { token } = require("../config.json");
let log = bunyan.createLogger({ name: "shardmanager" });

db.sync();

let manager;
if (process.env.NODE_ENV !== "production")
	manager = new ShardingManager("./bot.ts", {
		token: token,
		execArgv: ["-r", "ts-node/register"],
	});
else
	manager = new ShardingManager("./bot.js", {
		token: token,
	});

manager.on("shardCreate", (shard) => log.info(`Launched shard ${shard.id}`));
manager.spawn();
