import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class PollCommand extends Command {
	constructor() {
		super("poll", {
			aliases: ["poll", "makepoll", "newpoll", "createpoll"],
			description: "Makes a poll",
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
			userPermissions: ["MANAGE_MESSAGES"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.question)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"Please provide a question!"
				)
			);
		if (args.choice1 && !args.choice2)
			return message.channel.send(
				this.client.error(
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
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				author: {
					name: "Poll",
				},
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				fields: [
					{ name: ":one:", value: "Yes", inline: true },
					{ name: ":two:", value: "No", inline: true },
				],
			});
		else
			pollEmbed = new MessageEmbed({
				title: args.question,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				author: {
					name: "Poll",
				},
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
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
