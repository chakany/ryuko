import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";

export default class WarnCommand extends Command {
	constructor() {
		super("warn", {
			aliases: ["warn"],
			description: "Warn a Member",
			category: "Moderation",
			userPermissions: ["MANAGE_MESSAGES"],
			modOnly: true,
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

	exec(message: Message, args: any) {
		if (!args.member)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must provide a member to warn!",
					),
				],
			});

		// Check role hierarchy
		if (
			args.member.roles.highest.position >=
			message.member!.roles.highest.position
		)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Permissions",
						"You cannot warn someone that has the same, or a higher role than you!",
					),
				],
			});

		this.client.db.addPunishment(
			message.guild!.id,
			"warn",
			args.member.user.id,
			message.author.id,
			args.reason,
		);

		message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Warned",
						fields: [
							{
								name: "Member",
								value: args.member.toString(),
								inline: true,
							},
							{
								name: "Warned by",
								value: message.member!.toString(),
								inline: true,
							},
							{
								name: "Reason",
								value: args.reason
									? `\`${args.reason}\``
									: "No Reason Provided",
							},
						],
					},
					message,
				),
			],
		});

		args.member.send(
			`You have been Warned\n\n**Warned By:** ${message.member!}\n**Reason:** ${
				args.reason ? `\`${args.reason}\`` : "No Reason Provided"
			}`,
		);

		this.client.sendToLogChannel(message.guild!, "member", {
			embeds: [
				this.embed(
					{
						title: "Member Warned",
						thumbnail: {
							url: args.member.user.displayAvatarURL({
								dynamic: true,
							}),
						},
						footer: {},
						fields: [
							{
								name: "Member",
								value: args.member,
								inline: true,
							},
							{
								name: "Warned by",
								value: message.member!,
								inline: true,
							},
							{
								name: "Reason",
								value: args.reason
									? `\`${args.reason}\``
									: "No Reason Provided",
							},
						],
					},
					message,
				),
			],
		});
	}
}
