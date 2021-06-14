import { Command } from "discord-akairo";
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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a valid emoji!"
				)
			);

		return message.channel.send(
			new MessageEmbed({
				title: "Enlarged Emoji",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				thumbnail: {
					url: args.emoji.startsWith("<a")
						? `https://cdn.discordapp.com/emojis/${args.emoji
								.split(":")[2]
								.slice(0, -1)}.gif`
						: `https://cdn.discordapp.com/emojis/${args.emoji
								.split(":")[2]
								.slice(0, -1)}.png`,
				},
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				fields: [
					{
						name: "Emoji",
						value: `\`${args.emoji.split(":")[1]}\``,
					},
				],
			})
		);
	}
}
