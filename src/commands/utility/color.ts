import Command from "../../struct/Command";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

export default class ColorCommand extends Command {
	constructor() {
		super("color", {
			aliases: ["color"],
			description: "Generates an image of a color from your input.",
			category: "Utility",
			args: [
				{
					id: "hexcode",
					type: "string",
				},
			],
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

	async exec(message: Message, args: any): Promise<any> {
		if (!args.hexcode)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must provide a color!",
					),
				],
			});

		const loadMessage = await message.channel.send(
			this.client.emoji.loading + "*Please wait..*",
		);

		const image = await this._getImage(args.hexcode);

		const attachment = new MessageAttachment(image.data, "image.png");

		loadMessage.delete();

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Color",
						image: {
							url: "attachment://image.png",
						},
					},
					message,
				),
			],
			files: [attachment],
		});
	}
}
