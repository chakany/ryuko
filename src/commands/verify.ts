import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class PingCommand extends Command {
	constructor() {
		super("verify", {
			aliases: ["verify"],
			description: "account",
		});
	}

	async exec(message: Message) {
		const key = Math.random().toString(16).substr(2, 8);
		this.client.redis.addNewVerification(
			message.guild!.id,
			message.author.id,
			key
		);

		this.client.redis.subscribe(`verification-${key}`);

		const sentMessage = await message.channel.send(
			`${this.client.config.siteUrl}/verify?state=${key}`
		);

		const miCallback = (channel: any, message: any) => {
			if (channel !== `verification-${key}`) return;

			sentMessage.edit("Verified successfully!");
			return this.client.redis.unsubscribe(`verification-${key}`);
		};

		return this.client.redis.on("message", miCallback);
	}
}
