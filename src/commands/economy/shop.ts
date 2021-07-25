import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class ShopCommand extends Command {
	constructor() {
		super("shop", {
			aliases: ["shop", "store"],
			description: "Buy Things",
			category: "Economy",
		});
	}

	async exec(message: Message) {
		return message.channel.send("There are no items in the shop!");
	}
}
