import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class SayCommand extends Command {
	constructor() {
		super("say", {
			aliases: ["say"],
			description: "Make the me repeat what you say",
			category: "Utility",
			ownerOnly: true,
			args: [
				{
					id: "response",
					type: "string",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.response)
			return message.channel.send(
				this.client.error(
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
