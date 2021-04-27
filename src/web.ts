import express from "express";
import next from "next";
import bunyan from "bunyan";

const config = require("../config.json");

const dev = process.env.NODE_ENV !== "production";
let log = bunyan.createLogger({ name: "webserver" });
const app = next({ dev, dir: "../" });
const handle = app.getRequestHandler();

app
	.prepare()
	.then(() => {
		const server = express();

		server.get("*", (req, res) => {
			return handle(req, res);
		});

		server.listen(config.port, () => {
			log.info(`Listening on port ${config.port}`);
		});
	})
	.catch((ex) => {
		log.error(ex.stack);
		process.exit(1);
	});
