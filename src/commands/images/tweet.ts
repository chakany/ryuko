import { Command } from "discord-akairo";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

import Error from "../../utils/error";

const { imgApiUrl } = require("../../../config.json");

export default class TweetCommand extends Command {
	constructor() {
		super("tweet", {
			aliases: ["tweet", "trumptweet"],
			description:
				"Generates a trump tweet, with the contents being your inputted text.",
			category: "Fun",
			args: [
				{
					id: "text",
					type: "string",
				},
			],
		});
	}

	async _getImage(text: string): Promise<AxiosResponse> {
		return axios.get(imgApiUrl + "/tweet", {
			params: {
				text: text,
			},
			responseType: "stream",
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.text)
			return message.channel.send(
				Error(message, this, "Invalid Arguments", "You must provide some text!")
			);

		const loadMessage = await message.channel.send(
			"<a:loading:837775261373956106> *Please wait..*"
		);

		try {
			const image = await this._getImage(message.util?.parsed?.content!);

			const attachment = new MessageAttachment(image.data, "image.png");

			loadMessage.delete();

			return message.channel.send({
				embed: new MessageEmbed({
					title: "Tweet",
					color: 16716032,
					image: {
						url: "attachment://image.png",
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
				}),
				files: [attachment],
			});
		} catch (error) {
			this.client.log.error(error);
			message.channel.send(
				Error(message, this, "An error occurred", "An unknown error occurred")
			);
			return false;
		}
	}
}
