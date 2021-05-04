import express from "express";
import path from "path";
import bunyan from "bunyan";

import home from "./routes/home";

import commands from "./routes/commands";

let log = bunyan.createLogger({ name: "webserver" });
const app = express();

const config = require("../config.json");

try {
	app.set("view engine", "ejs");
	app.set("views", "../app/pages");
	app.use(express.static("../app/static"));

	// Binds
	app.use("/", home);
	app.use("/commands", commands);

	app.listen(config.port, () => {
		log.info(`Bound to port ${config.port}`);
	});
} catch (error) {
	log.error(error);
}
