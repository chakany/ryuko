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

	async exec(message: Message, args: any): Promise<any> {
		if (!args.member)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a member to unmute!"
					),
				],
			});

		const mutedMembers = this.client.jobs.get(message.guild!.id);
		if (!mutedMembers?.get(args.member.id))
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"That user is not currently muted!"
					),
				],
			});
		const muteRole = this.client.settings.get(
			message.guild!.id,
			"muteRole",
			null
		);
		if (!muteRole)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Configuration",
						`You must have a muted role set!\n+ Use ${
							message.util?.parsed?.prefix
						}${
							this.handler.findCommand("muterole").aliases[0]
						} to set one.`
					),
				],
			});

		args.member.roles.remove(await message.guild?.roles.fetch(muteRole));
		mutedMembers.get(args.member.id)?.cancel();
		mutedMembers.delete(args.member.id);

		this.client.jobs.set(message.guild!.id, mutedMembers);

		this.client.db.unpunishMember(
			args.member.id,
			message.guild!.id,
			"mute"
		);

		message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Member Unmuted",
						fields: [
							{
								name: "Unmuted",
								value: args.member.toString(),
								inline: true,
							},
							{
								name: "Unmuted By",
								value: message.member!.toString(),
								inline: true,
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
							title: "Member Unmuted",
							thumbnail: {
								url: (<GuildMember>(
									args.member
								)).user.displayAvatarURL({
									dynamic: true,
								}),
							},
							footer: {},
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
						},
						message
					),
				],
			},
			message.guild!
		);
	}
}
