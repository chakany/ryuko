import { Command } from "discord-akairo";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import crypto from "crypto";

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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Configuration",
					`You must configure verification first! Use the \`${
						message.util?.parsed?.prefix
					}${this.handler.findCommand(
						"verification"
					)}\` command to set it up.`
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

		const level = this.client.settings.get(
			message.guild!.id,
			"verificationLevel",
			"low"
		);

		const key = crypto.randomBytes(4).toString("hex");
		this.client.redis.addNewVerification(
			message.guild!.id,
			message.author.id,
			level,
			key
		);

		this.client.redis.subscribe(`verification-${key}`);

		let sentMessage: Message;
		try {
			sentMessage = await message.author.send(
				new MessageEmbed({
					title: "Account Verification",
					description: `[Please verify your account to continue to **${
						message.guild!.name
					}**](${this.client.config.siteUrl}/verify?state=${key})`,
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: `Expires in 10 minutes\n${message.author.tag}`,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				})
			);
		} catch (error) {
			await this.client.redis.unsubscribe(`verification-${key}`);
			this.client.redis.removeVerification(key);
			return message.channel.send(
				this.client.error(
					message,
					this,
					"",
					"I cannot DM you! Check your privacy settings and try again"
				)
			);
		}

		let completed = false;

		const miCallback = async (channel: any, recieved: any) => {
			if (channel !== `verification-${key}`) return;
			let call = JSON.parse(recieved);

			if (call.message == "verified") {
				sentMessage.edit(
					new MessageEmbed({
						title: "Verified Successfully",
						description: `Welcome to **${
							message.guild!.name
						}**! Enjoy your stay!`,
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
					})
				);
				if (
					this.client.settings.get(
						message.guild!.id,
						"logging",
						false
					)
				)
					(<TextChannel>(
						message.guild!.channels.cache.get(
							this.client.settings.get(
								message.guild!.id,
								"loggingChannel",
								null
							)
						)
					)).send(
						new MessageEmbed({
							title: "Member Verified",
							thumbnail: {
								url: message.author.displayAvatarURL({
									dynamic: true,
								}),
							},
							color: message.guild?.me?.displayHexColor,
							timestamp: new Date(),
							fields: [
								{
									name: "Member",
									value: message.member,
								},
							],
						})
					);
				message.member!.roles.add(
					// @ts-expect-error 2345
					message.guild!.roles.cache.get(verifiedRole)
				);
			} else if (call.message == "alt") {
				switch (level) {
					case "strict":
						message.member?.ban({
							reason: `Alternate Account of User <@!${call.originalAccount}>`,
						});
						sentMessage.edit(
							new MessageEmbed({
								title: "Banned from Guild",
								description: `Using alternate accounts in **${
									message.guild!.name
								}** is prohibited. If you believe this is an error, please contact the server owner.`,
								color: message.guild?.me?.displayHexColor,
								timestamp: new Date(),
								footer: {
									text: message.author.tag,
									icon_url: message.author.displayAvatarURL({
										dynamic: true,
									}),
								},
							})
						);
						break;
					case "medium":
						const userPunishments =
							await this.client.db.getCurrentUserPunishments(
								message.author.id,
								message.guild!.id
							);

						if (userPunishments[0].memberId) {
							message.member?.ban({
								reason: `Alternate Account of User <@!${call.originalAccount}>`,
							});
							sentMessage.edit(
								new MessageEmbed({
									title: "Banned from Guild",
									description: `Evading punishments in **${
										message.guild!.name
									}** is prohibited. If you believe this is an error, please contact the server owner.`,
									color: message.guild?.me?.displayHexColor,
									timestamp: new Date(),
									footer: {
										text: message.author.tag,
										icon_url:
											message.author.displayAvatarURL({
												dynamic: true,
											}),
									},
								})
							);
						} else {
							message.member!.roles.add(
								// @ts-expect-error 2345
								message.guild!.roles.cache.get(verifiedRole)
							);
							sentMessage.edit(
								new MessageEmbed({
									title: "Verified Successfully",
									description: `Welcome to **${
										message.guild!.name
									}**! Enjoy your stay!`,
									color: message.guild?.me?.displayHexColor,
									timestamp: new Date(),
									footer: {
										text: message.author.tag,
										icon_url:
											message.author.displayAvatarURL({
												dynamic: true,
											}),
									},
								})
							);
							if (
								this.client.settings.get(
									message.guild!.id,
									"logging",
									false
								)
							)
								(<TextChannel>(
									message.guild!.channels.cache.get(
										this.client.settings.get(
											message.guild!.id,
											"loggingChannel",
											null
										)
									)
								)).send(
									new MessageEmbed({
										title: "Member Verified",
										thumbnail: {
											url: message.author.displayAvatarURL(
												{ dynamic: true }
											),
										},
										color: message.guild?.me
											?.displayHexColor,
										timestamp: new Date(),
										fields: [
											{
												name: "Member",
												value: message.member,
											},
										],
									})
								);
						}
						break;
					case "low":
						message.member!.roles.add(
							// @ts-expect-error 2345
							message.guild!.roles.cache.get(verifiedRole)
						);
						sentMessage.edit(
							new MessageEmbed({
								title: "Verified Successfully",
								description: `Welcome to **${
									message.guild!.name
								}**! Enjoy your stay!`,
								color: message.guild?.me?.displayHexColor,
								timestamp: new Date(),
								footer: {
									text: message.author.tag,
									icon_url: message.author.displayAvatarURL({
										dynamic: true,
									}),
								},
							})
						);
						if (
							this.client.settings.get(
								message.guild!.id,
								"logging",
								false
							)
						)
							(<TextChannel>(
								message.guild!.channels.cache.get(
									this.client.settings.get(
										message.guild!.id,
										"loggingChannel",
										null
									)
								)
							)).send(
								new MessageEmbed({
									title: "Member Verified",
									thumbnail: {
										url: message.author.displayAvatarURL({
											dynamic: true,
										}),
									},
									color: message.guild?.me?.displayHexColor,
									timestamp: new Date(),
									fields: [
										{
											name: "Member",
											value: message.member,
										},
									],
								})
							);
				}
			}
			completed = true;
			this.client.redis.removeListener("message", miCallback);
			return this.client.redis.unsubscribe(`verification-${key}`);
		};

		setTimeout(() => {
			this.client.redis.removeListener("message", miCallback);
			this.client.redis.unsubscribe(`verification-${key}`);
		}, 600000);

		return this.client.redis.on("message", miCallback);
	}
}
