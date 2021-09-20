import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message, GuildMember } from "discord.js";

export default class BanCommand extends Command {
	constructor() {
		super("ban", {
			aliases: ["ban"],
			description: "Ban a member",
			category: "Moderation",
			clientPermissions: ["BAN_MEMBERS"],
			userPermissions: ["BAN_MEMBERS"],
			adminOnly: true,
			args: [
				{
					id: "member",
					type: Argument.union("member", "string"),
				},
				{
					id: "reason",
					type: "string",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.member)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must provide a member to ban!"
					),
				],
			});

		let user;

		try {
			user =
				args.member instanceof GuildMember
					? args.member.user
					: await this.client.users.fetch(args.member);

			if (args.member instanceof GuildMember) {
				// Check Role Hierarchy
				if (
					args.member.roles.highest.position >=
					message.member!.roles.highest.position
				)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Permissions",
								"You cannot kick someone that has the same, or a higher role than you!"
							),
						],
					});

				// Check if we can ban them
				if (!(<GuildMember>args.member).bannable)
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Permissions",
								"I cannot ban this person! Please check the role hierarchy!"
							),
						],
					});

				// Ban them
				(<GuildMember>args.member).ban({
					reason: args.reason
						? `${args.reason} | Banned by ${message.member}`
						: `No Reason Provided | Banned by ${message.member}`,
					days: 7,
				});
			} else {
				if (message.guild!.bans.cache.has(args.member))
					return message.channel.send({
						embeds: [
							this.error(
								message,
								"Invalid Usage",
								"That member is already banned!"
							),
						],
					});

				await message.guild!.members.ban(args.member, {
					reason: args.reason
						? `${args.reason} | Banned by ${message.member}`
						: `No Reason Provided | Banned by ${message.member}`,
				});
			}
		} catch (error) {
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"An Error Occurred",
						"Make sure that you entered a valid User ID, and try again."
					),
				],
			});
		}

		message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Banned Member",
						fields: [
							{
								name: "Member",
								value: user,
								inline: true,
							},
							{
								name: "Banned by",
								value: message.member,
								inline: true,
							},
							{
								name: "Reason",
								value: args.reason
									? args.reason
									: "None Provided",
							},
						],
					},
					message
				),
			],
		});

		this.client.sendToLogChannel(
			{
				embeds: [
					this.embed(
						{
							title: "Member Banned",
							thumbnail: {
								url: user.displayAvatarURL({
									dynamic: true,
								}),
							},
							footer: {},
							fields: [
								{
									name: "Member",
									value: user!.toString(),
									inline: true,
								},
								{
									name: "Banned by",
									value: message.member!.toString(),
									inline: true,
								},
								{
									name: "Reason",
									value: args.reason
										? args.reason
										: "None Provided",
								},
							],
						},
						message
					),
				],
			},
			message.guild!
		);
	}
}
