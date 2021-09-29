import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class StealEmojiCommand extends Command {
	constructor() {
		super("stealemoji", {
			aliases: ["stealemoji", "stealemote"],
			description: "Steal an emote from another server",
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
		const emoji = await message.guild!.emojis.create(
			args.emoji.startsWith("<a")
				? `https://cdn.discordapp.com/emojis/${args.emoji
						.split(":")[2]
						.slice(0, -1)}.gif`
				: `https://cdn.discordapp.com/emojis/${args.emoji
						.split(":")[2]
						.slice(0, -1)}.png`,
			args.emoji.split(":")[1],
		);

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Stole Emoji",
						description: `The name of the emoji is called \`${emoji.name}\``,
						thumbnail: {
							url: args.emoji.startsWith("<a")
								? `https://cdn.discordapp.com/emojis/${args.emoji
										.split(":")[2]
										.slice(0, -1)}.gif`
								: `https://cdn.discordapp.com/emojis/${args.emoji
										.split(":")[2]
										.slice(0, -1)}.png`,
						},
					},
					message,
				),
			],
		});
	}
}
