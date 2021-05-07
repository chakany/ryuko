import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

export default class PollCommand extends Command {
	constructor() {
		super("poll", {
			aliases: ["poll", "makepoll", "newpoll", "createpoll"],
			description: "Makes a new poll",
			category: "Utility",
			args: [
				{
					id: "question",
					type: "string",
				},
				{
					id: "choice1",
					type: "string",
				},
				{
					id: "choice2",
					type: "string",
				},
			],
			userPermissions: ["ADMINISTRATOR"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.question)
			return message.channel.send(
				Error(message, this, "Invalid Argument", "Please provide a question!")
			);
		if (args.choice1 && !args.choice2)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"Please provide a second choice!"
				)
			);
		message.delete();
		let pollEmbed;
		if (!args.choice1)
			pollEmbed = new MessageEmbed({
				title: args.question,
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: "Poll",
				},
				footer: {
					text: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				fields: [
					{ name: ":one:", value: "Yes", inline: true },
					{ name: ":two:", value: "No", inline: true },
				],
			});
		else
			pollEmbed = new MessageEmbed({
				title: args.question,
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: "Poll",
				},
				footer: {
					text: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				fields: [
					{ name: ":one:", value: args.choice1, inline: true },
					{ name: ":two:", value: args.choice2, inline: true },
				],
			});
		let pollmessage = message.channel.send(pollEmbed);
		(await pollmessage).react("1️⃣");
		(await pollmessage).react("2️⃣");
		return;
	}
}
