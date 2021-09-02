import Command from "../../struct/Command";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

export default class DominantcolorCommand extends Command {
	constructor() {
		super("dominantcolor", {
			aliases: ["dominantcolor"],
			description:
				"Outputs the most dominant color in an image. Supports image attachments.",
			category: "Images",
		});
	}

	async _getDominantColor(image: string): Promise<AxiosResponse> {
		return axios.get(this.client.config.imgApiUrl + "/dominantColor", {
			params: {
				avatar: image,
			},
			responseType: "json",
		});
	}

	async _getImage(color: string): Promise<AxiosResponse> {
		return axios.get(this.client.config.imgApiUrl + "/color", {
			params: {
				color: color,
			},
			responseType: "stream",
		});
	}

	async exec(message: Message) {
		const loadMessage = await message.channel.send(
			this.client.emoji.loading + "*Please wait..*"
		);

		const messageAttachment = message.attachments.first();

		const dominantColor = await this._getDominantColor(
			messageAttachment
				? messageAttachment.url
				: message.author.avatarURL({
						dynamic: true,
						format: "png",
				  }) || ""
		);

		const image = await this._getImage(dominantColor.data.hex);

		const attachment = new MessageAttachment(image.data, "image.png");

		loadMessage.delete();

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title:
							"Dominant Color\n`" + dominantColor.data.hex + "`",
						image: {
							url: "attachment://image.png",
						},
					},
					message
				),
			],
			files: [attachment],
		});
	}
}
