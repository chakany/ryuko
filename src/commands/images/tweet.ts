import { Command } from "discord-akairo";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

export default class TweetCommand extends Command {
	constructor() {
		super("tweet", {
			aliases: ["tweet", "trumptweet"],
			description:
				"Generates a trump tweet, with the contents being your inputted text.",
			category: "Images",
			args: [
				{
					id: "text",
					type: "string",
				},
			],
		});
	}

	async _getImage(text: string): Promise<AxiosResponse> {
		return axios.get(this.client.config.imgApiUrl + "/tweet", {
			params: {
				text: text,
			},
			responseType: "stream",
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.text)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide some text!"
				)
			);

		const loadMessage = await message.channel.send(
			this.client.config.emojis.loading + "*Please wait..*"
		);

		try {
			const image = await this._getImage(message.util?.parsed?.content!);

			const attachment = new MessageAttachment(image.data, "image.png");

			loadMessage.delete();

			return message.channel.send({
				embed: new MessageEmbed({
					title: "Tweet",
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
