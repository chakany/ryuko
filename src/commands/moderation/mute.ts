import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { add } from "date-fns";
import schedule from "node-schedule";

import Error from "../../utils/error";

const args = [
	{
		id: "user",
		type: "member",
	},
	{
		id: "length",
		type: "string",
	},
	{
		id: "reason",
		type: "string",
	},
];

export default class MuteCommand extends Command {
	protected args = args;

	constructor() {
		super("mute", {
			aliases: ["mute"],
			category: "Moderation",
			description: "Mutes a member",
			clientPermissions: ["MANAGE_ROLES"],
			channel: "guild",
			args: args,
			modOnly: true,
		});
	}

	// Input anything and spit it back out in milliseconds
	_resolveTime(input: any): any {
		let length = input.replace(/[^\d]/g, "");
		if (
			input.endsWith("s") ||
			input.endsWith("sec") ||
			input.endsWith("second") ||
			input.endsWith("seconds")
		)
			return add(new Date(), { seconds: length });
		else if (input.endsWith("m") || input.endsWith("min"))
			return add(new Date(), { minutes: length });
		else if (
			input.endsWith("h") ||
			input.endsWith("hour") ||
			input.endsWith("hours")
		)
			return add(new Date(), { hours: length });
		else if (
			input.endsWith("d") ||
			input.endsWith("day") ||
			input.endsWith("days")
		)
			return add(new Date(), { days: length });
		else if (
			input.endsWith("w") ||
			input.endsWith("week") ||
			input.endsWith("weeks")
		)
			return add(new Date(), { weeks: length });
		else if (
			input.endsWith("mo") ||
			input.endsWith("mon") ||
			input.endsWith("month") ||
			input.endsWith("months")
		)
			return add(new Date(), { months: length });
		else if (
			input.endsWith("y") ||
			input.endsWith("year") ||
			input.endsWith("years")
		)
			return add(new Date(), { years: length });
	}

	async exec(message: Message, args: any): Promise<any> {
		// Argument checks
		if (!args.user)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You must provide a user to mute!"
				)
			);

		const endDate = this._resolveTime(args.length);

		if (!args.length || endDate === undefined)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You must provide a valid length to mute for!\n+ It must be specified too! Ex: '10m' is 10 minutes"
				)
			);

		if (!args.reason)
			return message.channel.send(
				Error(message, this, "Invalid Argument", "You must provide a reason!")
			);
		const reason = message.util?.parsed?.content!.split(`${args.length} `)[1];

		// Check if there is a role configured for muted people
		const muteRole = this.client.settings.get(
			message.guild!.id,
			"muteRole",
			null
		);
		if (muteRole === null)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Configuration",
					`You must have a muted role set!\n+ Use ${
						message.util?.parsed?.prefix
					}${this.handler.findCommand("drag").aliases[0]} to set one.`
				)
			);

		// Check if they are already muted
		console.log(this.client.jobs.get(message.guild!.id));
		if (this.client.jobs.get(message.guild!.id)?.get(args.user.id)) {
			return message.channel.send(
				Error(message, this, "Invalid Usage", "That person is already muted!")
			);
		}

		args.user.roles.add(
			// @ts-ignore
			message.guild?.roles.cache.get(muteRole)
		);

		message.channel.send(
			new MessageEmbed({
				title: "Member Muted",
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: message.author.tag + " (" + message.author.id + ")",
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: message.client.user?.tag,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
				fields: [
					{ name: "Muted by", value: `${message.author}`, inline: true },
					{ name: "Muted Member", value: `${args.user}`, inline: true },
					{ name: "Length", value: "`" + args.length + "`", inline: true },
					{ name: "Reason", value: "`" + `${reason}` + "`" },
				],
			})
		);

		const outer = this;

		// Assign them the mute
		const job = schedule.scheduleJob(endDate, function () {
			if (args.user.roles.cache.has(muteRole))
				// @ts-ignore
				args.user.roles.remove(message.guild?.roles.cache.get(muteRole));

			outer.client.jobs.get(message.guild!.id)?.delete(args.user.id);
			const cachedMutes = new Map(
				JSON.parse(
					outer.client.settings.get(message.guild!.id, "mutedUsers", null)
				)
			);

			cachedMutes.delete(args.user.id);

			outer.client.settings.set(
				message.guild!.id,
				"mutedUsers",
				// @ts-ignore
				JSON.stringify([...cachedMutes])
			);

			const logChannel = outer.client.settings.get(
				message.guild!.id,
				"loggingChannel",
				null
			);

			if (logChannel)
				message
					.guild!.channels.cache.get(`${logChannel}`)
					// @ts-ignore
					?.send(
						new MessageEmbed({
							title: "Member Unmuted",
							description: `${args.user}'s mute has expired.`,
							color: 16716032,
							timestamp: new Date(),
							footer: {
								text: outer.client.user?.tag,
								icon_url: outer.client.user?.avatarURL({ dynamic: true }) || "",
							},
						})
					);
		});
		let guildJobs = this.client.jobs.get(message.guild!.id);
		if (!guildJobs) guildJobs = new Map();
		guildJobs?.set(args.user.id, job);
		this.client.jobs.set(message.guild!.id, guildJobs!);

		let cachedMutes = this.client.settings.get(
			message.guild!.id,
			"mutedUsers",
			null
		);

		if (typeof cachedMutes === "string") cachedMutes = JSON.parse(cachedMutes);

		cachedMutes = new Map(cachedMutes);

		cachedMutes.set(args.user.id, endDate.toJSON());

		this.client.settings.set(
			message.guild!.id,
			"mutedUsers",
			// @ts-ignore
			JSON.stringify([...cachedMutes])
		);

		const logChannel = outer.client.settings.get(
			message.guild!.id,
			"loggingChannel",
			null
		);

		if (logChannel)
			message
				.guild!.channels.cache.get(`${logChannel}`)
				// @ts-ignore
				?.send(
					new MessageEmbed({
						title: "Member Muted",
						color: 16716032,
						timestamp: new Date(),
						author: {
							name: message.author.tag + " (" + message.author.id + ")",
							icon_url: message.author.avatarURL({ dynamic: true }) || "",
						},
						footer: {
							text: message.client.user?.tag,
							icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
						},
						fields: [
							{ name: "Muted by", value: `${message.author}`, inline: true },
							{ name: "Muted Member", value: `${args.user}`, inline: true },
							{ name: "Length", value: "`" + args.length + "`", inline: true },
							{ name: "Reason", value: "`" + `${reason}` + "`" },
						],
					})
				);

		return;
	}
}
