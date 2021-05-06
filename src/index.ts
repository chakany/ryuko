import { ShardingManager } from "discord.js";
import bunyan from "bunyan";
import express from "express";
import db from "./utils/db";
const { token, port } = require("../config.json");
let log = bunyan.createLogger({ name: "shardmanager" });

db.sync();

let manager: ShardingManager;
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

const app = express();

import home from "./routes/home";

app.set("view engine", "ejs");
app.set("views", "../app/pages");

app.use("/", home);

app.use(express.static("../app/static"));

app.listen(port, () => {
	log.info(`Bound to port ${port}`);
});

export { manager, log };
