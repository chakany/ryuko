import { Command } from "discord-akairo";
import { Message } from "discord.js";

import Error from "../../utils/error";

const arg = [
	{
		id: "response",
		type: "string",
	},
];

export default class SayCommand extends Command {
	protected args = arg;

	constructor() {
		super("say", {
			aliases: ["say"],
			description: "Make the bot repeat what you say",
			category: "Utility",
			ownerOnly: true,
			args: arg,
		});
	}

	async exec(message: Message, args: any) {
		if (!args.response)
			Error(
				message,
				this,
				"Invalid Argument",
				"You must provide something to say!"
			);
		return message.channel.send(args.response);
	}
}
