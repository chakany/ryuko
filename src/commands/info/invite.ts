import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class InviteCommand extends Command {
	constructor() {
		super("invite", {
			aliases: ["invite", "inv"],
			description: "Invite me to your server!",
			category: "Info",
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		return message.channel.send(
			new MessageEmbed({
				title: `Invite me!`,
				description: `Want to invite me to your server? [Click me!](${await this.client.generateInvite(
					{
						permissions: "ADMINISTRATOR",
					}
				)} "Invite Me")`,
				thumbnail: {
					url: this.client.user?.displayAvatarURL({
						dynamic: true,
					}),
				},
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
