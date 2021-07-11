import { Command } from "discord-akairo";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import qrcode from "qrcode";

export default class PingCommand extends Command {
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

	async exec(message: Message): Promise<any> {
		try {
			const code = new MessageAttachment(
				await qrcode.toBuffer(message.util?.parsed?.content!),
				"qrcode.png"
			);

			return message.channel.send({
				embed: new MessageEmbed({
					title: "QR Code Generated!",
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					fields: [
						{
							name: "Input",
							value: `\`${message.util?.parsed?.content!}\``,
						},
					],
					image: {
						url: "attachment://qrcode.png",
					},
				}),
				files: [code],
			});
		} catch (error) {
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An Error Occurred",
					error.message
				)
			);
		}
	}
}
