import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Db from "../../utils/db";

export default class LinkCommand extends Command {
	constructor() {
		super("link", {
			aliases: ["link"],
			category: "Utility",
			args: [
				{
					id: "username",
					type: "string",
				},
			],
			description: "Link your Discord and MC accounts together",
			channel: "guild",
			guild: ["796140447260737536"],
		});
	}

	async exec(message: Message, args: any) {
		const waitMessage = await message.channel.send("*Please Wait...*");
		if (!(await Db.checkLinkedUser(message.author.id))) {
			if (args.username) {
				await Db.linkUser(message.author.id, args.username);
				waitMessage.edit(
					new MessageEmbed({
						title: ":white_check_mark: Linked!",
						description:
							"You have successfully linked your Minecraft and Discord accounts, you can now play on the servers. Have fun!",
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({ dynamic: true }),
						},
					})
				);
			} else {
				waitMessage.edit(
					this.client.error(
						message,
						this,
						"Invalid Argument",
						"You didn't provide a Minecraft Username!"
					)
				);
			}
		} else {
			waitMessage.edit(
				this.client.error(
					message,
					this,
					"Account is already linked",
					"You have already linked your accounts! To unlink contact jacany#0001"
				)
			);
		}
	}
}
