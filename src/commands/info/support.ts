import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class SupportCommand extends Command {
	constructor() {
		super("support", {
			aliases: ["support"],
			description: "Provides a link to the Support Server.",
			category: "Info",
		});
	}

	async exec(message: Message) {
		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Support",
						description: `Need help? Join my [Support Server](${this.client.config.supportInvite} "Join support server")`,
					},
					message,
				),
			],
		});
	}
}
