import Command from "../../struct/Command";
import { Message, MessageEmbed, TextChannel } from "discord.js";

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

	async exec(message: Message, args: any): Promise<any> {
		if (!args.member)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide a member to warn!"
				)
			);

		// Check role hierarchy
		if (
			args.member.roles.highest.position >=
			message.member!.roles.highest.position
		)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Permissions",
					"You cannot warn someone that has the same, or a higher role than you!"
				)
			);

		this.client.db.warnMember(
			args.member.user.id,
			message.guild!.id,
			message.author.id,
			args.reason
		);

		message.channel.send(
			new MessageEmbed({
				title: "Warned",
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
			})
		);

		args.member.send(
			`You have been Warned\n\n**Warned By:** ${message.member!}\n**Reason:** ${
				args.reason ? `\`${args.reason}\`` : "No Reason Provided"
			}`
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
			))?.send(
				new MessageEmbed({
					title: "Member Warned",
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					thumbnail: {
						url: args.member.user.displayAvatarURL({
							dynamic: true,
						}),
					},
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
				})
			);
	}
}
