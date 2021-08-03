import Command from "../../struct/Command";
import { Message, MessageEmbed, GuildMember } from "discord.js";

export default class MoveCommand extends Command {
	constructor() {
		super("unmute", {
			aliases: ["unmute"],
			category: "Moderation",
			description: "Unmute a member",
			clientPermissions: ["MANAGE_ROLES"],
			userPermissions: ["MANAGE_ROLES"],
			args: [
				{
					id: "member",
					type: "member",
				},
			],
			modOnly: true,
		});
	}

	exec(message: Message, args: any): any {
		if (!args.member)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a member to unmute!"
				)
			);

		const mutedMembers = this.client.jobs.get(message.guild!.id);
		if (!mutedMembers?.get(args.member.id))
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"That user is not currently muted!"
				)
			);
		const muteRole = this.client.settings.get(
			message.guild!.id,
			"muteRole",
			null
		);
		if (!muteRole)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Configuration",
					`You must have a muted role set!\n+ Use ${
						message.util?.parsed?.prefix
					}${
						this.handler.findCommand("muterole").aliases[0]
					} to set one.`
				)
			);

		args.member.roles.remove(message.guild?.roles.cache.get(muteRole));
		mutedMembers.get(args.member.id)?.cancel();
		mutedMembers.delete(args.member.id);

		this.client.jobs.set(message.guild!.id, mutedMembers);

		this.client.db.unpunishMember(
			args.member.id,
			message.guild!.id,
			"mute"
		);

		message.channel.send(
			new MessageEmbed({
				title: "Member Unmuted",
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
						name: "Unmuted",
						value: args.member,
						inline: true,
					},
					{
						name: "Unmuted By",
						value: message.member,
						inline: true,
					},
				],
			})
		);
		const logChannel = this.client.settings.get(
			message.guild!.id,
			"loggingChannel",
			null
		);

		if (
			logChannel &&
			this.client.settings.get(message.guild!.id, "logging", false)
		)
			message
				.guild!.channels.cache.get(`${logChannel}`)
				// @ts-ignore
				?.send(
					new MessageEmbed({
						title: "Member Unmuted",
						color: message.guild?.me?.displayHexColor,
						thumbnail: {
							url: (<GuildMember>(
								args.member
							)).user.displayAvatarURL({
								dynamic: true,
							}),
						},
						timestamp: new Date(),
						fields: [
							{
								name: "Unmuted",
								value: args.member,
								inline: true,
							},
							{
								name: "Unmuted By",
								value: message.member,
								inline: true,
							},
						],
					})
				);
	}
}
