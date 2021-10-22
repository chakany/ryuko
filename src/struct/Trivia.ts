import fs from "fs";
import path from "path";
import { Collection } from "discord.js";
import { Question } from "./Trivia.d";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { siteUrl } = require("../../config.json");

export default class Trivia {
	public topics: Collection<string, Question[]>;

	constructor(dir: string) {
		this.topics = new Collection();

		const files = fs.readdirSync(path.resolve(__dirname, dir));

		files.forEach((file) => {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const topic = require(path.resolve(__dirname, dir, file));

			topic.forEach((question: Question) => {
				if (question.image) question.image = siteUrl + question.image;
			});

			this.topics.set(file.replace(".json", ""), topic);
		});
	}

	public getQuestion(name: string): Question | null {
		const questions = this.topics.get(name);

		return questions
			? questions[Math.floor(Math.random() * questions.length)]
			: null;
	}

	public isCorrect(question: Question, answer: string): boolean {
		if (
			typeof question.answer != "object" &&
			question.answer.toLowerCase() == answer.toLowerCase()
		)
			return true;

		for (const element of question.answer) {
			if (element.toLowerCase() == answer.toLowerCase()) return true;
		}

		return false;
	}
}
