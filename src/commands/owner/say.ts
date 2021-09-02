import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class SayCommand extends Command {
	constructor() {
		super("say", {
			aliases: ["say"],
			description: "Make the me repeat what you say",
			category: "Owner",
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
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide something to say!"
					),
				],
			});
		message.channel.send(`${message.util?.parsed?.content}`);
		return message.delete();
	}
}
