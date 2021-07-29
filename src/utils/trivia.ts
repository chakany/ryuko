import fs from "fs";
import path from "path";
import { Collection } from "discord.js";

const { siteUrl } = require("../../config.json");

interface Question {
	question: string;
	image?: string;
	answer: string | string[];
}

interface Topic {
	title: string;
	description: string;
	questions: Question[];
}

export default class Trivia {
	public topics: Collection<string, Topic>;

	constructor(dir: string) {
		this.topics = new Collection();

		const files = fs.readdirSync(path.resolve(__dirname, dir));

		files.forEach((file) => {
			const topic = require(path.resolve(__dirname, dir, file));

			topic.questions.forEach((question: Question) => {
				if (question.image) question.image = siteUrl + question.image;
			});

			this.topics.set(topic.title, topic);
		});
	}

	public getQuestion(name: string): Question | null {
		const questions = this.topics.find(
			(topic) => topic.title.toLowerCase() == name.toLowerCase()
		)?.questions;

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
