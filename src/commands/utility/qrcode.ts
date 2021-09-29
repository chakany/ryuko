import Command from "../../struct/Command";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import qrcode from "qrcode";

export default class QrcodeCommand extends Command {
	constructor() {
		super("qrcode", {
			aliases: ["qrcode", "qr"],
			description: "Generate a QR Code from inputted text",
			category: "Utility",
			args: [
				{
					id: "content",
					type: "string",
				},
			],
		});
	}

	async exec(message: Message, args: any) {
		if (!args.content)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must input some text to turn into a QR Code!",
					),
				],
			});
		const code = new MessageAttachment(
			await qrcode.toBuffer(message.util!.parsed!.content!),
			"qrcode.png",
		);

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "QR Code Generated!",
						fields: [
							{
								name: "Input",
								value: `\`${message.util!.parsed!.content!}\``,
							},
						],
						image: {
							url: "attachment://qrcode.png",
						},
					},
					message,
				),
			],
			files: [code],
		});
	}
}
