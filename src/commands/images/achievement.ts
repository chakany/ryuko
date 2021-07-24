import Command from "../../struct/Command";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

export default class AchievementCommand extends Command {
	constructor() {
		super("achievement", {
			aliases: ["achievement"],
			description:
				"Generates a Minecraft achivement with the text you input. Supports image attachments.",
			category: "Images",
			args: [
				{
					id: "text",
					type: "string",
				},
			],
		});
	}

	async _getImage(image: string, text: string): Promise<AxiosResponse> {
		return axios.get(this.client.config.imgApiUrl + "/achievement", {
			params: {
				avatar: image,
				text: text,
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
				  }) || "",
			message.util?.parsed?.content!
		);

		const attachment = new MessageAttachment(image.data, "image.png");

		loadMessage.delete();

		return message.channel.send({
			embed: new MessageEmbed({
				title: "Achievement",
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
