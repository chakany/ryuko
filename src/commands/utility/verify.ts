import Command from "../../struct/Command";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import crypto from "crypto";
import ms from "ms";
import moment from "moment";
import myRedis from "../../utils/redis";

export default class VerifyCommand extends Command {
	constructor() {
		super("verify", {
			aliases: ["verify"],
			clientPermissions: ["MANAGE_ROLES"],
			description:
				"Verify your user account, requires user verification to be setup in the guild with the 'verification' command",
			category: "Utility",
			cooldown: 600000,
		});
	}

	async exec(message: Message): Promise<any> {
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
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Configuration",
						`You must configure verification first! Use the \`${
							message.util?.parsed?.prefix
						}${this.handler.findCommand(
							"verification"
						)}\` command to set it up.`
					),
				],
			});
		else if (message.member!.roles.cache.get(verifiedRole)) {
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Member",
						"You have already been verified!"
					),
				],
			});
		}

		const level = this.client.settings.get(
			message.guild!.id,
			"verificationLevel",
			"low"
		);

		const redis = new myRedis();

		const key = crypto.randomBytes(4).toString("hex");
		redis.addNewVerification(
			message.guild!.id,
			message.author.id,
			level,
			key
		);

		redis.subscribe(`verification-${key}`);

		let sentMessage: Message;
		try {
			sentMessage = await message.author.send(
				`The server **${
					message.guild!.name
				}** has Member Verification enabled.\nTo verify, please visit: ${
					this.client.config.siteUrl
				}/verify?state=${key}\n\nThis expires <t:${moment()
					.add(ms("10m"), "ms")
					.unix()}:R>`
			);
		} catch (error) {
			await redis.unsubscribe(`verification-${key}`);
			redis.removeVerification(key);
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"",
						"I cannot DM you! Check your privacy settings and try again"
					),
				],
			});
		}

		let completed = false;

		const miCallback = async (channel: any, recieved: any) => {
			if (channel !== `verification-${key}`) return;
			let call = JSON.parse(recieved);

			if (call.message == "verified") {
				sentMessage.edit(
					`Verified Successfully, Welcome to **${
						message.guild!.name
					}**!`
				);

				this.client.sendToLogChannel(message.guild!, "member", {
					embeds: [
						this.embed(
							{
								title: "Member Verified",
								thumbnail: {
									url: message.author.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Member",
										value: message.member!.toString(),
									},
								],
							},
							message
						),
					],
				});
				message.member!.roles.add(
					// @ts-expect-error
					await message.guild!.roles.fetch(verifiedRole)
				);
			} else if (call.message == "alt") {
				switch (level) {
					case "strict":
						message.member?.ban({
							reason: `Alternate Account of User <@!${call.originalAccount}>`,
						});
						sentMessage.edit({
							embeds: [
								this.embed(
									{
										title: "Banned from Guild",
										description: `Using alternate accounts in **${
											message.guild!.name
										}** is prohibited. If you believe this is an error, please contact the server owner.`,
									},
									message
								),
							],
						});

						this.client.sendToLogChannel(message.guild!, "member", {
							embeds: [
								this.embed(
									{
										title: "Member Verification Failed",
										description:
											"An alternate account was detected, they have been banned.",
										thumbnail: {
											url: message.author.displayAvatarURL(
												{
													dynamic: true,
												}
											),
										},
										footer: {},
										fields: [
											{
												name: "Member",
												value: message.member!.toString(),
												inline: true,
											},
											{
												name: "Original Account",
												value: `<@${call.originalAccount}>`,
												inline: true,
											},
										],
									},
									message
								),
							],
						});
						break;
					case "medium":
						const userPunishments =
							await this.client.db.getCurrentUserPunishments(
								call.originalAccount
									? call.originalAccount
									: null,
								message.guild!.id
							);

						if (
							userPunishments[0]?.memberId ||
							message.guild!.bans.cache.has(call.originalAccount)
						) {
							message.member?.ban({
								reason: `Alternate Account of User <@!${call.originalAccount}>`,
							});
							sentMessage.edit({
								embeds: [
									this.embed(
										{
											title: "Banned from Guild",
											description: `Evading punishments in **${
												message.guild!.name
											}** is prohibited. If you believe this is an error, please contact the server owner.`,
										},
										message
									),
								],
							});

							this.client.sendToLogChannel(
								message.guild!,
								"member",
								{
									embeds: [
										this.embed(
											{
												title: "Member Verification Failed",
												description:
													"An alternate account was detected, they have been banned.",
												thumbnail: {
													url: message.author.displayAvatarURL(
														{ dynamic: true }
													),
												},
												footer: {},
												fields: [
													{
														name: "Member",
														value: message.member!.toString(),
														inline: true,
													},
													{
														name: "Original Account",
														value: `<@${call.originalAccount}>`,
														inline: true,
													},
												],
											},
											message
										),
									],
								}
							);
						} else {
							message.member!.roles.add(
								// @ts-expect-error 2345
								await message.guild!.roles.fetch(verifiedRole)
							);
							sentMessage.edit({
								embeds: [
									this.embed(
										{
											title: "Verified Successfully",
											description: `Welcome to **${
												message.guild!.name
											}**! Enjoy your stay!`,
										},
										message
									),
								],
							});

							this.client.sendToLogChannel(
								message.guild!,
								"member",
								{
									embeds: [
										this.embed(
											{
												title: "Member Verified",
												thumbnail: {
													url: message.author.displayAvatarURL(
														{ dynamic: true }
													),
												},
												footer: {},
												fields: [
													{
														name: "Member",
														value: message.member!.toString(),
													},
												],
											},
											message
										),
									],
								}
							);
						}
						break;
					case "low":
						message.member!.roles.add(
							// @ts-expect-error 2345
							await message.guild!.roles.fetch(verifiedRole)
						);
						sentMessage.edit({
							embeds: [
								this.embed(
									{
										title: "Verified Successfully",
										description: `Welcome to **${
											message.guild!.name
										}**! Enjoy your stay!`,
									},
									message
								),
							],
						});

						this.client.sendToLogChannel(message.guild!, "member", {
							embeds: [
								this.embed(
									{
										title: "Member Verified",
										thumbnail: {
											url: message.author.displayAvatarURL(
												{
													dynamic: true,
												}
											),
										},
										footer: {},
										fields: [
											{
												name: "Member",
												value: message.member!.toString(),
											},
										],
									},
									message
								),
							],
						});
				}
			}
			completed = true;
			redis.removeListener("message", miCallback);
			return redis.unsubscribe(`verification-${key}`);
		};

		setTimeout(() => {
			redis.removeListener("message", miCallback);
			redis.unsubscribe(`verification-${key}`);
		}, 600000);

		return redis.on("message", miCallback);
	}
}
