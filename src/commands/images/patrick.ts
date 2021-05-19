import { Command } from "discord-akairo";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

const { imgApiUrl } = require("../../../config.json");

export default class PatrickCommand extends Command {
	constructor() {
		super("patrick", {
			aliases: ["patrick"],
			description:
				"Generates an image of patrick screaming after seeing a photo. Supports image attachments.",
			category: "Fun",
		});
	}

	async _getImage(image: string): Promise<AxiosResponse> {
		return axios.get(imgApiUrl + "/patrick", {
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
					: message.author.avatarURL({
							dynamic: true,
							format: "png",
					  }) || ""
			);

			const attachment = new MessageAttachment(image.data, "image.png");

			loadMessage.delete();

			return message.channel.send({
				embed: new MessageEmbed({
					title: "Patrick",
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
		} catch (error) {
			this.client.log.error(error);
			message.channel.send(
				this.client.error(
					message,
					this,
					"An error occurred",
					"An unknown error occurred"
				)
			);
			return false;
		}
	}
}
