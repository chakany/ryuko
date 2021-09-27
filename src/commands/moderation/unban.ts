import Command from "../../struct/Command";
import { Message, MessageEmbed, TextChannel } from "discord.js";

export default class UnbanCommand extends Command {
	constructor() {
		super("unban", {
			aliases: ["unban"],
			description: "Unban a member",
			category: "Moderation",
			clientPermissions: ["BAN_MEMBERS"],
			userPermissions: ["BAN_MEMBERS"],
			adminOnly: true,
			args: [
				{
					id: "member",
					type: "string",
				},
				{
					id: "reason",
					type: "string",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		let user;

		try {
			user = await this.client.users.fetch(args.member);
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

		if (!user)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must provide a user to unban!"
					),
				],
			});

		if (!message.guild!.bans.cache.has(args.member))
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"That member is not currently banned!"
					),
				],
			});

		try {
			message.guild!.members.unban(
				args.member,
				args.reason
					? `${args.reason} | Unbanned by ${message.member}`
					: `No Reason Provided | Unbanned by ${message.member}`
			);
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
						title: "Unbanned Member",
						fields: [
							{
								name: "Member",
								value: user.toString(),
								inline: true,
							},
							{
								name: "Unbanned by",
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
				this.embed(
					{
						title: "Member Unbanned",
						thumbnail: {
							url: user.displayAvatarURL({
								dynamic: true,
							}),
						},
						footer: {},
						fields: [
							{
								name: "Member",
								value: user.toString(),
								inline: true,
							},
							{
								name: "Unbanned by",
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
	}
}
