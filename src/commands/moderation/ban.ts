import { Argument } from "discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed, GuildMember, TextChannel } from "discord.js";

export default class BanCommand extends Command {
	constructor() {
		super("ban", {
			aliases: ["ban"],
			description: "Ban a member",
			category: "Moderation",
			clientPermissions: ["BAN_MEMBERS"],
			userPermissions: ["BAN_MEMBERS"],
			modOnly: true,
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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide a member to ban!"
				)
			);

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
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Permissions",
							"You cannot kick someone that has the same, or a higher role than you!"
						)
					);

				// Check if we can ban them
				if (!(<GuildMember>args.member).bannable)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Permissions",
							"I cannot ban this person! Please check the role hierarchy!"
						)
					);

				// Ban them
				(<GuildMember>args.member).ban({
					reason: args.reason
						? `${args.reason} | Banned by ${message.member}`
						: `No Reason Provided | Banned by ${message.member}`,
					days: 7,
				});
			} else {
				if ((await message.guild!.fetchBans()).has(args.member))
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Usage",
							"That member is already banned!"
						)
					);

				await message.guild!.members.ban(args.member, {
					reason: args.reason
						? `${args.reason} | Banned by ${message.member}`
						: `No Reason Provided | Banned by ${message.member}`,
				});
			}
		} catch (error) {
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An Error Occurred",
					"Make sure that you entered a valid User ID, and try again."
				)
			);
		}

		message.channel.send(
			new MessageEmbed({
				title: "Banned Member",
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
						value: args.reason ? args.reason : "None Provided",
					},
				],
			})
		);

		if (this.client.settings.get(message.guild!.id, "logging", false))
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
					title: "Member Banned",
					thumbnail: {
						url: user.displayAvatarURL({
							dynamic: true,
						}),
					},
					color: message.guild!.me?.displayHexColor,
					timestamp: new Date(),
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
							value: args.reason ? args.reason : "None Provided",
						},
					],
				})
			);
	}
}
