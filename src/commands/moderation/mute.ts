import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import Client from "../../struct/Client";
import { Moment } from "moment";
import { Message, MessageEmbed } from "discord.js";
import { setMute } from "../../utils/command";

export default class MuteCommand extends Command {
	constructor() {
		super("mute", {
			aliases: ["mute"],
			category: "Moderation",
			description: "Mutes a member",
			clientPermissions: ["MANAGE_ROLES"],
			userPermissions: ["MANAGE_ROLES"],
			args: [
				{
					id: "member",
					type: "member",
				},
				{
					id: "length",
					type: Argument.product("future", "string"),
				},
				{
					id: "reason",
					type: "string",
				},
			],
			modOnly: true,
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		// Argument checks
		if (!args.member)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a user to mute!",
					),
				],
			});

		if (!args.length || !args.length[1])
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a valid length to mute for!\nIt must be specified too! Ex: '10m' is 10 minutes",
					),
				],
			});

		const modRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			null,
		);

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
						"You cannot mute someone that has the same, or a higher role than you!",
					),
				],
			});

		// Check if there is a role configured for muted people
		const muteRole = this.client.settings.get(
			message.guild!.id,
			"muteRole",
			null,
		);
		if (muteRole === null)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Configuration",
						`You must have a muted role set!\n+ Use ${
							message.util?.parsed?.prefix
						}${
							this.handler.findCommand("muterole").aliases[0]
						} to set one.`,
					),
				],
			});

		// Check if they are already muted
		if (
			this.client.jobs.mutes.get(message.guild!.id)?.get(args.member.id)
		) {
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"That person is already muted!",
					),
				],
			});
		}
		args.member.roles.add(await message.guild?.roles.fetch(muteRole));

		message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Muted Member",
						fields: [
							{
								name: "Member",
								value: args.member.toString(),
								inline: true,
							},
							{
								name: "Muted by",
								value: message.member!.toString(),
								inline: true,
							},
							{
								name: "Length",
								value: `<t:${(<Moment>(
									args.length[0]
								)).unix()}:R> (<t:${(<Moment>(
									args.length[0]
								)).unix()}:f>)`,
							},
							{
								name: "Reason",
								value: args.reason
									? `\`${args.reason}\``
									: "None",
							},
						],
					},
					message,
				),
			],
		});

		setMute(
			this.client as unknown as Client,
			message.guild!,
			args.member,
			message.member!,
			muteRole,
			args.length[0],
			args.reason,
		);

		this.client.db.muteUser(
			message.guild!.id,
			"mute",
			args.member.id,
			message.author.id,
			args.reason,
			args.length[0],
		);

		this.client.sendToLogChannel(message.guild!, "member", {
			embeds: [
				this.embed(
					{
						title: "Member Muted",
						thumbnail: {
							url: args.member.user.displayAvatarURL({
								dynamic: true,
							}),
						},
						footer: {},
						fields: [
							{
								name: "Member",
								value: args.member.toString(),
								inline: true,
							},
							{
								name: "Muted by",
								value: message.member!.toString(),
								inline: true,
							},
							{
								name: "Length",
								value: `<t:${(<Moment>(
									args.length[0]
								)).unix()}:R> (<t:${(<Moment>(
									args.length[0]
								)).unix()}:f>)`,
							},
							{
								name: "Reason",
								value: args.reason
									? `\`${args.reason}\``
									: "None",
							},
						],
					},
					message,
				),
			],
		});
	}
}
