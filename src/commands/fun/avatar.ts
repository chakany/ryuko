import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class AvatarCommand extends Command {
	constructor() {
		super("avatar", {
			aliases: ["avatar", "ava", "pfp"],
			description: "Get's the user's avatar or the person who is mentioned.",
			category: "Fun",
			channel: "guild",
			args: [
				{
					id: "user",
					type: "user",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (args.user)
			return message.channel.send(
				new MessageEmbed({
					title: `${args.user.username}'s Avatar`,
					color: 16716032,
					image: {
						url: args.user.avatarURL({ dynamic: true }) || "",
					},
					timestamp: new Date(),
					author: {
						name: message.author.tag,
						icon_url: message.author.avatarURL({ dynamic: true }) || "",
					},
					footer: {
						text: message.client.user?.tag,
						icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
					},
				})
			);

		return message.channel.send(
			new MessageEmbed({
				title: `${message.author.username}'s Avatar`,
				color: 16716032,
				image: {
					url: message.author.avatarURL({ dynamic: true }) || "",
				},
				timestamp: new Date(),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: message.client.user?.tag,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
			})
		);
	}
}
