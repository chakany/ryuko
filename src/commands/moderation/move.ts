import Command from "../../struct/Command";
import { GuildMember } from "discord.js";
import { Message, MessageEmbed, TextChannel } from "discord.js";

export default class MoveCommand extends Command {
	constructor() {
		super("move", {
			aliases: ["move"],
			category: "Moderation",
			description: "Move members into another voice channel",
			clientPermissions: ["MOVE_MEMBERS"],
			userPermissions: ["MOVE_MEMBERS"],

			args: [
				{
					id: "member",
					type: "member",
				},
				{
					id: "channel",
					type: "voiceChannel",
				},
			],
			modOnly: true,
		});
	}

	exec(message: Message, args: any): any {
		const victim = args.member;
		const oldChannel = (<GuildMember>args.member).voice.channel;
		const Channel = args.channel;

		// Check if the member is provided
		if (!victim)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a user to move!"
					),
				],
			});

		// Check if the channel is valid
		if (!Channel)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a voice channel to move to!"
					),
				],
			});

		victim.voice.setChannel(Channel);

		this.client.sendToLogChannel(
			{
				embeds: [
					this.embed(
						{
							title: "Member Moved",
							thumbnail: {
								url: args.member.user.displayAvatarURL({
									dynamic: true,
								}),
							},
							footer: {},
							fields: [
								{
									name: "From",
									value: oldChannel?.toString(),
									inline: true,
								},
								{
									name: "To",
									value: Channel.toString(),
									inline: true,
								},
								{
									name: "Member",
									value: args.member.toString(),
								},
								{
									name: "Moved by",
									value: message.member!.toString(),
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
