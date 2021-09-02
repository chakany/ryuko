import Command from "../../struct/Command";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

export default class PictureCommand extends Command {
	constructor() {
		super("picture", {
			aliases: ["picture"],
			description:
				"Generates an 'I love this picture.' meme. Supports image attachments.",
			category: "Images",
		});
	}

	async _getImage(image: string): Promise<AxiosResponse> {
		return axios.get(this.client.config.imgApiUrl + "/picture", {
			params: {
				avatar: image,
			},
			responseType: "stream",
		});
	}

	async exec(message: Message) {
		const loadMessage = await message.channel.send(
			this.client.emoji.loading + "*Please wait..*"
		);

		const messageAttachment = message.attachments.first();

		const image = await this._getImage(
			messageAttachment
				? messageAttachment.url
				: message.author.avatarURL({
						dynamic: true,
						format: "png",
				  }) || ""
		);

		const attachment = new MessageAttachment(image.data, "image.png");

		loadMessage.delete();

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Picture",
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
