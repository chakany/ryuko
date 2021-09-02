import Listener from "../../struct/Listener";
import { Guild, User, TextChannel, MessageEmbed } from "discord.js";

export default class GuildBanAddListener extends Listener {
	constructor() {
		super("guildBanAdd", {
			event: "guildBanAdd",
			emitter: "client",
		});
	}

	async exec(guild: Guild, user: User) {
		const fetchedLogs = await guild.fetchAuditLogs({
			limit: 1,
			type: "MEMBER_BAN_ADD",
		});

		const banLog = fetchedLogs.entries.first();

		if (!banLog)
			return this.client.sendToLogChannel(
				{
					embeds: [
						this.embed(
							{
								title: "Member Banned",
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
								],
							},
							user,
							guild
						),
					],
				},
				guild
			);

		const { executor, target } = banLog;

		if (executor == guild.me?.user) return;

		if ((<User>target).id === user.id) {
			return this.client.sendToLogChannel(
				{
					embeds: [
						this.embed(
							{
								title: "Member Banned",
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
										name: "Banned By",
										value: executor!.toString(),
										inline: true,
									},
									{
										name: "Reason",
										value:
											banLog.reason?.toString() ||
											"No Reason Provided",
									},
								],
							},
							user,
							guild
						),
					],
				},
				guild
			);
		} else {
			return this.client.sendToLogChannel(
				{
					embeds: [
						this.embed(
							{
								title: "Member Banned",
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
								],
							},
							user,
							guild
						),
					],
				},
				guild
			);
		}
	}
}
