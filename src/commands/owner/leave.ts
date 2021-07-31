import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class LeaveCommand extends Command {
	constructor() {
		super("leave", {
			aliases: ["leave"],
			description: "Make me leave a guild",
			category: "Owner",
			ownerOnly: true,
			args: [
				{
					id: "guild",
					type: "guild",
					default: (message: Message) => message.guild,
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		return args.guild.leave();
	}
}
