import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class RestartCommand extends Command {
	constructor() {
		super("restart", {
			aliases: ["restart"],
			description: "Restart the shard",
			category: "Utility",
			ownerOnly: true,
		});
	}

	async exec(message: Message) {
		await message.channel.send("Restarting the shard...");
		this.client.destroy();
		process.exit(1);
	}
}
