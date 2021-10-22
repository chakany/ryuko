import Logger from "./struct/Logger";
import { Category, Command } from "@ryukobot/discord-akairo";

const log = new Logger({
	name: "bot",
});

import Bot from "./struct/Client";

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
