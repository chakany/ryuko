import bunyan from "bunyan";
import { Category, Command } from "discord-akairo";

let log: bunyan;

if (process.env.NODE_ENV !== "production")
	log = bunyan.createLogger({
		name: "bot",
		stream: process.stdout,
		level: "debug",
	});
else
	log = bunyan.createLogger({
		name: "bot",
		stream: process.stdout,
	});

import Bot from "./struct/client";

const { token } = require("../config.json");

const client = new Bot(log);

const myArgs = process.argv.slice(2);
myArgs.forEach((arg) => {
	const module = arg.split("-", 4).slice(3)[0];
	let category: Category<any, any>;
	let command: Command;

	// declarations intented
	if ((category = client.commandHandler.findCategory(module))) {
		category.removeAll();
	} else if ((command = client.commandHandler.findCommand(module))) {
		command.remove();
	}
});

try {
	client.start(token);
} catch (e) {
	log.error(e);
}
