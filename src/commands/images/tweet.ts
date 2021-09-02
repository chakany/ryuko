import Command from "../../struct/Command";
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
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must provide some text!"
					),
				],
			});

		const loadMessage = await message.channel.send(
			this.client.emoji.loading + "*Please wait..*"
		);

		const image = await this._getImage(message.util?.parsed?.content!);

		const attachment = new MessageAttachment(image.data, "image.png");

		loadMessage.delete();

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Tweet",
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
