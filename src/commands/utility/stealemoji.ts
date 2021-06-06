import { Command } from "discord-akairo";
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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a valid emoji!"
				)
			);
		try {
			console.log(
				args.emoji.startsWith("<a")
					? `https://cdn.discordapp.com/emojis/${args.emoji
							.split(":")[2]
							.slice(0, -1)}.gif`
					: `https://cdn.discordapp.com/emojis/${args.emoji
							.split(":")[2]
							.slice(0, -1)}.png`
			);
			const emoji = await message.guild!.emojis.create(
				args.emoji.startsWith("<a")
					? `https://cdn.discordapp.com/emojis/${args.emoji
							.split(":")[2]
							.slice(0, -1)}.gif`
					: `https://cdn.discordapp.com/emojis/${args.emoji
							.split(":")[2]
							.slice(0, -1)}.png`,
				args.emoji.split(":")[1]
			);

			return message.channel.send(
				new MessageEmbed({
					title: "Stole Emoji",
					description: `The name of the emoji is called \`${emoji.name}\``,
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
				})
			);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An error occurred",
					error.message
				)
			);
		}
	}
}
