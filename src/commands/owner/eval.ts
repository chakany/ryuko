import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide some code to evaluate!"
				)
			);
		try {
			const code = message.util?.parsed?.content!;
			let evaled = await eval(code);

			if (typeof evaled !== "string")
				evaled = require("util").inspect(evaled);

			message.channel.send(
				new MessageEmbed({
					title: "Eval Result",
					description: `\`\`\`xl\n${this.clean(evaled)}\`\`\``,
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
		} catch (error) {
			message.channel.send(
				new MessageEmbed({
					title: "Eval Error",
					description: `\`\`\`xl\n${error}\`\`\``,
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
}
