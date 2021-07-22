import { Argument } from "discord-akairo";
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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a user to mute!"
				)
			);

		if (!args.length[0])
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a valid length to mute for!\nIt must be specified too! Ex: '10m' is 10 minutes"
				)
			);

		if (!args.reason)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a reason!"
				)
			);
		const reason = message.util!.parsed!.content!.split(
			`${args.length[1]} `
		)[1];

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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Permissions",
					"You cannot mute someone that has the same, or a higher role than you!"
				)
			);

		// Check if there is a role configured for muted people
		const muteRole = this.client.settings.get(
			message.guild!.id,
			"muteRole",
			null
		);
		if (muteRole === null)
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

		// Check if they are already muted
		if (this.client.jobs.get(message.guild!.id)?.get(args.member.id)) {
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"That person is already muted!"
				)
			);
		}
		args.member.roles.add(message.guild?.roles.cache.get(muteRole));

		message.channel.send(
			new MessageEmbed({
				title: "Member Muted",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				fields: [
					{
						name: "Member",
						value: args.member,
						inline: true,
					},
					{
						name: "Muted by",
						value: message.member,
						inline: true,
					},
					{
						name: "Length",
						value: ms(<any>ms(args.length[1]), {
							long: true,
						}),
						inline: true,
					},
					{ name: "Reason", value: reason },
				],
			})
		);

		const outer = this;

		// Assign them the mute
		const job = schedule.scheduleJob(args.length[0].toDate(), function () {
			if (args.member.roles.cache.has(muteRole))
				// @ts-ignore
				args.member.roles.remove(
					message.guild?.roles.cache.get(muteRole)
				);

			outer.client.jobs.get(message.guild!.id)?.delete(args.member.id);

			const logChannel = outer.client.settings.get(
				message.guild!.id,
				"loggingChannel",
				null
			);

			if (
				logChannel &&
				outer.client.settings.get(message.guild!.id, "logging", false)
			)
				message
					.guild!.channels.cache.get(`${logChannel}`)
					// @ts-ignore
					?.send(
						new MessageEmbed({
							title: "Member Unmuted",
							description: `${args.member}'s mute has expired.`,
							color: message.guild?.me?.displayHexColor,
							timestamp: new Date(),
						})
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
			reason,
			args.length[0]
		);

		const logChannel = outer.client.settings.get(
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
						title: "Member Muted",
						color: message.guild?.me?.displayHexColor,
						thumbnail: {
							url: args.member.user.displayAvatarURL({
								dynamic: true,
							}),
						},
						timestamp: new Date(),
						fields: [
							{
								name: "Member",
								value: args.member,
								inline: true,
							},
							{
								name: "Muted by",
								value: message.author,
								inline: true,
							},
							{
								name: "Length",
								value: ms(<any>ms(args.length[1]), {
									long: true,
								}),
								inline: true,
							},
							{ name: "Reason", value: reason },
						],
					})
				);
	}
}
