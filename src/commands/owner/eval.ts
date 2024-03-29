import Command from "../../struct/Command";
import { Message } from "discord.js";
import { inspect } from "util";

export default class EvalCommand extends Command {
	constructor() {
		super("eval", {
			aliases: ["eval"],
			description: "Evaluate some JavaScript",
			category: "Owner",
			ownerOnly: true,
			args: [
				{
					id: "code",
					type: "string",
				},
			],
		});
	}

	private clean(text: string) {
		if (typeof text === "string")
			return text
				.replace(/`/g, "`" + String.fromCharCode(8203))
				.replace(/@/g, "@" + String.fromCharCode(8203));
		else return text;
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.code)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must provide some code to evaluate!",
					),
				],
			});
		try {
			const code = message.util!.parsed!.content!;
			let evaled = await eval(code);

			if (typeof evaled !== "string") evaled = inspect(evaled);

			message.channel.send({
				embeds: [
					this.embed(
						{
							title: "Eval Result",
							description: `\`\`\`xl\n${this.clean(
								evaled,
							)}\`\`\``,
						},
						message,
					),
				],
			});
		} catch (error) {
			message.channel.send({
				embeds: [
					this.embed(
						{
							title: "Eval Error",
							description: `\`\`\`xl\n${error}\`\`\``,
						},
						message,
					),
				],
			});
		}
	}
}
