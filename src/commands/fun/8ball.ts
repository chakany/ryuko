import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class CoinflipCommand extends Command {
	constructor() {
		super("8ball", {
			aliases: ["8ball"],
			description: "Ask the Magic 8 Ball a question!",
			category: "Fun",
            args: [
                {
                    id: "question",
                    type: "string"
                }
            ]
		});
	}

	exec(message: Message, args: any): any {
        if (!args.question)
            return message.channel.send(this.client.error(message, this, "Invalid Argument", "You must ask a question!"));

        const responses = [
			"It is certain.",
			"It is decidedly so.",
			"Without a doubt.",
			"Yes - definitely.",
			"You may rely on it.",
			"As I see it, yes.",
			"Most likely.",
			"Outlook good.",
			"Yes.",
			"Signs point to yes.",
			"Reply hazy, try again.",
			"Ask again later.",
			"Better not tell you now.",
			"Cannot predict now.",
			"Concentrate and ask again.",
			"Don't count on it.",
			"My reply is no.",
			"My sources say no.",
			"Outlook not so good.",
			"Very doubtful.",
		];

        const number = Math.floor(Math.random() * responses.length);

		return message.channel.send(
			new MessageEmbed({
				title: message.util?.parsed?.content,
				description: responses[number],
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				author: {
					name: "🎱 8 Ball",
				},
			})
		);
	}
}
