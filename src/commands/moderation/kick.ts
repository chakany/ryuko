import Command from "../../struct/Command";
import { Message, MessageEmbed, GuildMember, TextChannel } from "discord.js";

export default class KickCommand extends Command {
	constructor() {
		super("kick", {
			aliases: ["kick"],
			description: "Kick a member",
			category: "Moderation",
			clientPermissions: ["KICK_MEMBERS"],
			userPermissions: ["KICK_MEMBERS"],
			adminOnly: true,
			args: [
				{
					id: "member",
					type: "member",
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
						"You must provide a member to kick!"
					),
				],
			});

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

		// Check if we can kick them
		if (!(<GuildMember>args.member).kickable)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Permissions",
						"I cannot kick this person! Please check the role hierarchy!"
					),
				],
			});

		// Kick them
		(<GuildMember>args.member).kick(
			args.reason
				? `${args.reason} | Kicked by ${message.member}`
				: `No Reason Provided | Kicked by ${message.member}`
		);

		message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Kicked Member",
						fields: [
							{
								name: "Member",
								value: args.member.toString(),
								inline: true,
							},
							{
								name: "Kicked by",
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
		});

		this.client.sendToLogChannel(message.guild!, "member", {
			embeds: [
				new MessageEmbed({
					title: "Member Kicked",
					thumbnail: {
						url: args.member.user.displayAvatarURL({
							dynamic: true,
						}),
					},
					color: message.guild!.me?.displayHexColor,
					timestamp: new Date(),
					fields: [
						{
							name: "Member",
							value: args.member.toString(),
							inline: true,
						},
						{
							name: "Kicked by",
							value: message.member!.toString(),
							inline: true,
						},
						{
							name: "Reason",
							value: args.reason ? args.reason : "None Provided",
						},
					],
				}),
			],
		});
	}
}
