import Command from "../struct/Command";
import { User, Guild } from "discord.js";
const str_replace = require("locutus/php/strings/str_replace");

export function generateUsage(command: Command, prefix: string): string {
	let flags = "";

	let arglist = "";

	if (command.args)
		for (const arg of command.args) {
			if (!arg.prompt && !arg.flag && !arg.match)
				arglist = arglist + ` <${arg.id}>`;
			else if (arg.match == "flag") flags = flags + ` [${arg.flag}]`;
			else if (arg.match == "option")
				arglist = arglist + ` {${arg.id}:${arg.default || "?"}}`;
		}

	let usage = `${prefix}${command.aliases[0]}${flags}${arglist}`;

	return usage;
}

export function replace(input: string, user: User): string {
	return str_replace(
		["(username", "(tag", "(discriminator", "(id", "(mention"],
		[user.username, user.tag, user.discriminator, user.id, user.toString()],
		input
	);
}
