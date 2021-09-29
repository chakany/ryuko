import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { Aki } from "aki-api";

export default class AkinatorCommand extends Command {
	constructor() {
		super("akinator", {
			aliases: ["akinator"],
			description: "Play with Akinator the Genie.",
			category: "Fun",
		});
	}

	// @ts-expect-error 2425
	async *args(message: Message) {
		const loadMessage = await message.channel.send(
			`${this.client.emoji.loading} ***Please Wait...***`,
		);

		const akinator = new Aki({ region: "en" });

		await akinator.start();

		loadMessage.delete();

		while (akinator.progress <= 70 || akinator.currentStep <= 78) {
			const result: string = yield {
				type: "string",
				prompt: {
					start: `**${
						akinator.question
					}**\n\n**Answers:**\n${akinator.answers.join(
						", ",
					)}, Back, or Stop`,
				},
			};

			const index = <0 | 1 | 2 | 3 | 4>(
				akinator.answers.findIndex(
					(value) =>
						(<string>value).toLowerCase() == result.toLowerCase(),
				)
			);

			if (result.toLowerCase() == "back") await akinator.back();
			else if (result.toLowerCase() == "stop") {
				await akinator.win();

				return { answers: akinator.answers };
			} else if (index > -1 && index < 5) await akinator.step(index);
		}

		await akinator.win();

		return { answers: akinator.answers };
	}

	async exec(message: Message, args: any) {
		message.channel.send({
			embeds: [
				this.embed(
					{
						title: args.answers[0].name,
						description: args.answers[0].description,
						image: {
							url: args.answers[0].absolute_picture_path,
						},
					},
					message,
				),
			],
		});
	}
}
