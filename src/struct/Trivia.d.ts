export interface Question {
	question: string;
	image?: string;
	answer: string | string[];
}

export interface Topic {
	title: string;
	description: string;
	questions: Question[];
}
