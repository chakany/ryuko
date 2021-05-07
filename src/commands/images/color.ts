import { Command } from "discord-akairo";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

import Error from "../../utils/error";

const { imgApiUrl } = require("../../../config.json");

export default class ColorCommand extends Command {
	constructor() {
		super("color", {
			aliases: ["color"],
			description: "Generates an image of a color from your input.",
			category: "Fun",
			args: [
				{
					id: "hexcode",
					type: "string",
				},
			],
		});
	}

	async _getImage(color: string): Promise<AxiosResponse> {
		return axios.get(imgApiUrl + "/color", {
			params: {
				color: color,
			},
			responseType: "stream",
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.hexcode)
			return message.channel.send(
				Error(message, this, "Invalid Arguments", "You must provide a color!")
			);

		const loadMessage = await message.channel.send(
			"<a:loading:837775261373956106> *Please wait..*"
		);

		try {
			const image = await this._getImage(args.hexcode);

			const attachment = new MessageAttachment(image.data, "image.png");

			loadMessage.delete();

			return message.channel.send({
				embed: new MessageEmbed({
					title: "Color",
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
