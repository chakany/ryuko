import bunyan from "bunyan";
let log = bunyan.createLogger({ name: "bot" });

import Bot from "./struct/client";

const { token } = require("../config.json");

const client = new Bot(log);

try {
	client.start(token);
} catch (e) {
	log.error(e);
}
