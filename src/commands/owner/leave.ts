import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class LeaveCommand extends Command {
	constructor() {
		super("leave", {
			aliases: ["leave"],
			description: "Make me leave the server",
			category: "Owner",
			ownerOnly: true,
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		return message.guild!.leave();
	}
}
