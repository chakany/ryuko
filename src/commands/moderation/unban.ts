import { Command } from "discord-akairo";
import { Message, MessageEmbed, TextChannel } from "discord.js";

export default class UnbanCommand extends Command {
	constructor() {
		super("unban", {
			aliases: ["unban"],
			description: "Unban a member",
			category: "Moderation",
			clientPermissions: ["BAN_MEMBERS"],
			userPermissions: ["BAN_MEMBERS"],
			modOnly: true,
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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An Error Occurred",
					"Make sure that you entered a valid User ID, and try again."
				)
			);
		}

		if (!user)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide a user to unban!"
				)
			);

		if (!(await message.guild!.fetchBans()).has(args.member))
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"That member is not currently banned!"
				)
			);

		try {
			message.guild!.members.unban(
				args.member,
				args.reason
					? `${args.reason} | Unbanned by ${message.member}`
					: `No Reason Provided | Unbanned by ${message.member}`
			);
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
				title: "Unbanned Member",
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
						name: "Unbanned by",
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
					title: "Member Unbanned",
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
							name: "Unbanned by",
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
