import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class EnlargeCommand extends Command {
	constructor() {
		super("enlarge", {
			aliases: ["enlarge"],
			description: "Make an emoji bigger",
			category: "Utility",
			args: [
				{
					id: "emoji",
					type: "string",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (
			!args.emoji ||
			(!args.emoji.startsWith("<:") && !args.emoji.startsWith("<a:"))
		)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a valid emoji!",
					),
				],
			});

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Enlarged Emoji",
						thumbnail: {
							url: args.emoji.startsWith("<a")
								? `https://cdn.discordapp.com/emojis/${args.emoji
										.split(":")[2]
										.slice(0, -1)}.gif`
								: `https://cdn.discordapp.com/emojis/${args.emoji
										.split(":")[2]
										.slice(0, -1)}.png`,
						},
						fields: [
							{
								name: "Emoji",
								value: `\`${args.emoji.split(":")[1]}\``,
							},
						],
					},
					message,
				),
			],
		});
	}
}
