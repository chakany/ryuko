import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class UsmapCommand extends Command {
	constructor() {
		super("usmap", {
			aliases: ["usmap"],
			description: "United States Map Trivia",
		});
	}

	// @ts-expect-error 2425
	*args(message: Message) {
		const question = this.client.trivia.getQuestion("usmap");

		// @ts-expect-error 7057
		const answer = yield {
			type: "string",
			prompt: {
				start: new MessageEmbed({
					title: "United States Map Trivia",
					description: `**${question?.question}**\n\nYou have **30 seconds**.`,
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					image: {
						url: question?.image,
					},
				}),
				timeout: new MessageEmbed({
					title: "Time Expired",
					description: `You ran out of time! Try again?`,
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				}),
				time: 30000,
			},
		};

		return { question, answer };
	}

	async exec(message: Message, args: any): Promise<any> {
		const results = this.client.trivia.isCorrect(
			args.question,
			args.answer
		);

		if (results) {
			const amount = Math.floor(Math.random() * 200);

			this.client.economy.addCoins(message.author.id, amount);

			return message.channel.send(
				new MessageEmbed({
					title: "Correct Answer!",
					description: `That answer is correct, take **${amount} coins**! ${this.client.emoji.coin}`,
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				})
			);
		} else
			return message.channel.send(
				new MessageEmbed({
					title: "Incorrect Answer!",
					description: `You got that answer wrong, the correct answer is **${
						typeof args.question.answer == "object"
							? args.question.answer[0]
							: args.question.answer
					}**.`,
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				})
			);
	}
}
