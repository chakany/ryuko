import { Inhibitor } from "discord-akairo";
import { Message } from "discord.js";

export default class BlacklistInhibitor extends Inhibitor {
	constructor() {
		super("blacklist", {
			reason: "You are blacklisted from using commands, contact jacany#0001 to resolve this.",
		});
	}

	exec(message: Message) {
		// Update this with a db function or some shit

		const blacklist = ["601654201814220810"];
		return blacklist.includes(message.author.id);
	}
}
