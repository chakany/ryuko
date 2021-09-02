import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class InviteCommand extends Command {
	constructor() {
		super("invite", {
			aliases: ["invite", "inv"],
			description: "Invite me to your server!",
			category: "Info",
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: `Invite me!`,
						description: `Want to invite me to your server? [Click me!](${this.client.generateInvite(
							{
								permissions: "ADMINISTRATOR",
								scopes: ["bot"],
							}
						)} "Invite Me")`,
						thumbnail: {
							url: this.client.user?.displayAvatarURL({
								dynamic: true,
							}),
						},
					},
					message
				),
			],
		});
	}
}
