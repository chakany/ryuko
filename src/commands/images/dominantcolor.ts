import { Command } from "discord-akairo";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

import Error from "../../utils/error";

const { imgApiUrl } = require("../../../config.json");

export default class DominantcolorCommand extends Command {
	constructor() {
		super("dominantcolor", {
			aliases: ["dominantcolor"],
			description:
				"Outputs the most dominant color in an image. Supports image attachments.",
			category: "Fun",
		});
	}

	async _getDominantColor(image: string): Promise<AxiosResponse> {
		return axios.get(imgApiUrl + "/dominantColor", {
			params: {
				avatar: image,
			},
			responseType: "json",
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

	async exec(message: Message) {
		const loadMessage = await message.channel.send(
			"<a:loading:837775261373956106> *Please wait..*"
		);

		try {
			const messageAttachment = message.attachments.first();

			const dominantColor = await this._getDominantColor(
				messageAttachment
					? messageAttachment.url
					: message.author.avatarURL({ dynamic: true, format: "png" }) || ""
			);

			const image = await this._getImage(dominantColor.data.hex);

			const attachment = new MessageAttachment(image.data, "image.png");

			loadMessage.delete();

			return message.channel.send({
				embed: new MessageEmbed({
					title: "Dominant Color\n`" + dominantColor.data.hex + "`",
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
