import express from "express";
import path from "path";
import bunyan from "bunyan";

import home from "./routes/home";

let log = bunyan.createLogger({ name: "webserver" });
const app = express();

const config = require("../config.json");

try {
	app.set("view engine", "ejs");
	app.set("views", path.join(__dirname, "pages"));

	// Binds
	app.use("/", home);

	app.listen(config.port, () => {
		log.info(`Bound to port ${config.port}`);
	});
} catch (error) {
	log.error(error);
}
