import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import crypto from "crypto";

export default class PingCommand extends Command {
	constructor() {
		super("verify", {
			aliases: ["verify"],
			clientPermissions: ["MANAGE_ROLES"],
			description: "account",
		});
	}

	async exec(message: Message): Promise<any> {
		this.client.settings.set(message.guild!.id, "verification", true);
		this.client.settings.set(
			message.guild!.id,
			"verifiedRole",
			"849449473825964072"
		);

		const verifiedRole = this.client.settings.get(
			message.guild!.id,
			"verifiedRole",
			null
		);

		if (
			!this.client.settings.get(
				message.guild!.id,
				"verification",
				false
			) ||
			!verifiedRole
		)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Configuration",
					"You must configure member verification first!"
				)
			);
		else if (message.member!.roles.cache.get(verifiedRole)) {
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Member",
					"You have already been verified!"
				)
			);
		}

		const key = crypto.randomBytes(4).toString("hex");
		this.client.redis.addNewVerification(
			message.guild!.id,
			message.author.id,
			key
		);

		this.client.redis.subscribe(`verification-${key}`);

		const sentMessage = await message.channel.send(
			`${this.client.config.siteUrl}/verify?state=${key}`
		);

		const miCallback = (channel: any, recieved: any) => {
			if (channel !== `verification-${key}`) return;
			let call = JSON.parse(recieved)

			if (call.message == "verified") {
				sentMessage.edit("Verified successfully!");
				message.member!.roles.add(
					// @ts-expect-error 2345
					message.guild!.roles.cache.get(verifiedRole)
				);
			} else if (call.message == "alt") {
				sentMessage.edit(
					`Why are you alting, <@!${call.originalAccount}>`
				);
			}
			return this.client.redis.unsubscribe(`verification-${key}`);
		};

		return this.client.redis.on("message", miCallback);
	}
}
