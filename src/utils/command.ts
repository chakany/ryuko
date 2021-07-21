import Command from "../struct/Command"

export function generateUsage(command: Command, prefix: string) {
	let usage: string = `${prefix}${command.id}`;
	let current;
	if (command.args)
		for (let i = 0; (current = command.args[i]); i++) {
			if (!current.prompt) usage = usage + ` <${current.id}>`;
		}

	return usage;
}
