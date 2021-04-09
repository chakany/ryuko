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

	async exec(message: Message, args: any): Promise<any> {
		if (!args.response)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You must provide something to say!"
				)
			);
		message.channel.send(`${message.util?.parsed?.content}`);
		return message.delete();
	}
}
