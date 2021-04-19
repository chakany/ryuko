import bunyan from "bunyan";
let log = bunyan.createLogger({ name: "bot" });

import Bot from "./struct/client";

const client = new Bot(log);

try {
	client.start();
} catch (e) {
	log.error(e);
}
