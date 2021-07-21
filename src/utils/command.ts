import Command from "../struct/Command";

export function generateUsage(command: Command, prefix: string) {
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
