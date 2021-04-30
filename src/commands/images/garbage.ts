import { Command } from "discord-akairo";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

import Error from "../../utils/error";

const { imgApiUrl } = require("../../../config.json");

export default class GarbageCommand extends Command {
	constructor() {
		super("garbage", {
			aliases: ["garbage"],
			description:
				"Generates a photo of an image in a trash can. Supports image attachments.",
			category: "Fun",
		});
	}

	async _getImage(image: string): Promise<AxiosResponse> {
		return axios.get(imgApiUrl + "/garbage", {
			params: {
				avatar: image,
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

			const image = await this._getImage(
				messageAttachment
					? messageAttachment.url
					: message.author.avatarURL({ dynamic: true }) || ""
			);

			const attachment = new MessageAttachment(image.data, "image.png");

			loadMessage.delete();

			return message.channel.send({
				embed: new MessageEmbed({
					title: "Garbage",
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
