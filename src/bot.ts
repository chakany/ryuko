import bunyan from "bunyan";

let log: bunyan;

if (process.env.NODE_ENV !== "production")
	log = bunyan.createLogger({
		name: "aina",
		stream: process.stdout,
		level: "debug",
	});
else
	log = bunyan.createLogger({
		name: "aina",
		stream: process.stdout,
	});

import Bot from "./struct/client";

const { token } = require("../config.json");

const client = new Bot(log);

try {
	client.start(token);
} catch (e) {
	log.error(e);
}
