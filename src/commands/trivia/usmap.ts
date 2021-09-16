import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class UsmapCommand extends Command {
	constructor() {
		super("usmap", {
			aliases: ["usmap"],
			description: "United States Map Trivia",
			category: "Trivia",
		});
	}

	// @ts-expect-error 2425
	*args(message: Message) {
		const question = this.client.trivia.getQuestion("usmap");

		// @ts-expect-error 7057
		const answer = yield {
			type: "string",
			prompt: {
				start: this.embed(
					{
						title: "United States Map Trivia",
						description: `**${question?.question}**\n\nYou have **15 seconds**.`,
						image: {
							url: question?.image,
						},
					},
					message
				),
				timeout: this.embed(
					{
						title: "Time Expired",
						description: `You ran out of time! The correct answer was **${
							typeof question?.answer == "object"
								? question?.answer[0]
								: question?.answer
						}**.`,
					},
					message
				),
				time: 15000,
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
			message.channel.send({
				embeds: [
					this.embed(
						{
							title: "Correct Answer!",
							description: `Nice Job!`,
						},
						message
					),
				],
			});
		} else
			message.channel.send({
				embeds: [
					this.embed(
						{
							title: "Incorrect Answer!",
							description: `You got that answer wrong, the correct answer is **${
								typeof args.question.answer == "object"
									? args.question.answer[0]
									: args.question.answer
							}**.`,
						},
						message
					),
				],
			});
	}
}
