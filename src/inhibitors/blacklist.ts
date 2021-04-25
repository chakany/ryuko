import { Inhibitor } from "discord-akairo";
import { Message } from "discord.js";

export default class BlacklistInhibitor extends Inhibitor {
	constructor() {
		super("blacklist", {
			reason: "blacklist",
		});
	}

	exec(message: Message) {
		// Update this with a db function or some shit

		const blacklist = ["425407787825233923"];
		return blacklist.includes(message.author.id);
	}
}
