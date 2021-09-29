import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class AvatarCommand extends Command {
	constructor() {
		super("avatar", {
			aliases: ["avatar", "ava", "pfp"],
			description:
				"Get's the user's avatar or the person who is mentioned.",
			category: "Utility",

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
			return message.channel.send({
				embeds: [
					this.embed(
						{
							title: `${args.user.username}'s Avatar`,
							image: {
								url: args.user.displayAvatarURL({
									dynamic: true,
								}),
							},
						},
						message,
					),
				],
			});

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${message.author.username}'s Avatar`,
						image: {
							url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
					},
					message,
				),
			],
		});
	}
}
