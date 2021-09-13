import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import schedule from "node-schedule";
import ms from "ms";

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
						"You must provide a user to mute!"
					),
				],
			});

		if (!args.length || !args.length[1])
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a valid length to mute for!\nIt must be specified too! Ex: '10m' is 10 minutes"
					),
				],
			});

		if (!args.reason)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a reason!"
					),
				],
			});

		const modRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			null
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
						"You cannot mute someone that has the same, or a higher role than you!"
					),
				],
			});

		// Check if there is a role configured for muted people
		const muteRole = this.client.settings.get(
			message.guild!.id,
			"muteRole",
			null
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
						} to set one.`
					),
				],
			});

		// Check if they are already muted
		if (this.client.jobs.get(message.guild!.id)?.get(args.member.id)) {
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"That person is already muted!"
					),
				],
			});
		}
		args.member.roles.add(message.guild?.roles.cache.get(muteRole));

		message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Member Muted",
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
								value: args.length[0].humanize(),
								inline: true,
							},
							{ name: "Reason", value: `\`${args.reason}\`` },
						],
					},
					message
				),
			],
		});

		const outer = this;

		// Assign them the mute
		const job = schedule.scheduleJob(args.length[0].toDate(), function () {
			if (args.member.roles.cache.has(muteRole))
				// @ts-ignore
				args.member.roles.remove(
					message.guild?.roles.cache.get(muteRole)
				);

			outer.client.jobs.get(message.guild!.id)?.delete(args.member.id);

			outer.client.sendToLogChannel(
				{
					embeds: [
						outer.embed(
							{
								title: "Member Unmuted",
								description: `${args.member}'s mute has expired.`,
								footer: {},
								thumbnail: {
									url: args.member.user.displayAvatarURL({
										dynamic: true,
									}),
								},
								fields: [
									{
										name: "Member",
										value: args.member.toString(),
										inline: true,
									},
									{
										name: "Length",
										value: `**${args.length[0].humanize()}** (<t:${args.length[0].unix()}:f>)`,
									},
									{
										name: "Muted By",
										value: message.member!.toString(),
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
		});
		let guildJobs = this.client.jobs.get(message.guild!.id);
		if (!guildJobs) guildJobs = new Map();
		guildJobs?.set(args.member.id, job);
		this.client.jobs.set(message.guild!.id, guildJobs!);

		this.client.db.muteUser(
			message.guild!.id,
			"mute",
			args.member.id,
			message.author.id,
			args.reason,
			args.length[0]
		);

		this.client.sendToLogChannel(
			{
				embeds: [
					this.embed(
						{
							title: "Member Muted",
							thumbnail: {
								url: args.member.user.displayAvatarURL({
									dynamic: true,
								}),
							},
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
									value: args.length[0].humanize(),
									inline: true,
								},
								{ name: "Reason", value: `\`${args.reason}\`` },
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
