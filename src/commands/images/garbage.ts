import Command from "../../struct/Command";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

export default class GarbageCommand extends Command {
	constructor() {
		super("garbage", {
			aliases: ["garbage"],
			description:
				"Generates a photo of an image in a trash can. Supports image attachments.",
			category: "Images",
		});
	}

	async _getImage(image: string): Promise<AxiosResponse> {
		return axios.get(this.client.config.imgApiUrl + "/garbage", {
			params: {
				avatar: image,
			},
			responseType: "stream",
		});
	}

	async exec(message: Message) {
		const loadMessage = await message.channel.send(
			this.client.config.emojis.loading + "*Please wait..*"
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
			embed: new MessageEmbed({
				title: "Garbage",
				color: message.guild?.me?.displayHexColor,
				image: {
					url: "attachment://image.png",
				},
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			}),
			files: [attachment],
		});
	}
}
