import Listener from "../../struct/Listener";
import { GuildBan, User } from "discord.js";

export default class GuildBanAddListener extends Listener {
	constructor() {
		super("guildBanAdd", {
			event: "guildBanAdd",
			emitter: "client",
		});
	}

	async exec(ban: GuildBan) {
		if (ban.partial) await ban.fetch();

		const fetchedLogs = await ban.guild
			.fetchAuditLogs({
				limit: 1,
				type: "MEMBER_BAN_ADD",
			})
			.catch();

		const banLog = fetchedLogs.entries.first();

		if (!banLog)
			return this.client.sendToLogChannel(ban.guild, "member", {
				embeds: [
					this.embed(
						{
							title: "Member Banned",
							thumbnail: {
								url: ban.user.displayAvatarURL({
									dynamic: true,
								}),
							},
							footer: {},
							fields: [
								{
									name: "Member",
									value: ban.user.toString(),
									inline: true,
								},
							],
						},
						ban.user,
						ban.guild,
					),
				],
			});

		const { executor, target } = banLog;

		if (executor == ban.guild.me?.user) return;

		if ((<User>target).id === ban.user.id) {
			return this.client.sendToLogChannel(ban.guild, "member", {
				embeds: [
					this.embed(
						{
							title: "Member Banned",
							thumbnail: {
								url: ban.user.displayAvatarURL({
									dynamic: true,
								}),
							},
							footer: {},
							fields: [
								{
									name: "Member",
									value: ban.user.toString(),
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
						ban.user,
						ban.guild,
					),
				],
			});
		} else {
			return this.client.sendToLogChannel(ban.guild, "member", {
				embeds: [
					this.embed(
						{
							title: "Member Banned",
							thumbnail: {
								url: ban.user.displayAvatarURL({
									dynamic: true,
								}),
							},
							footer: {},
							fields: [
								{
									name: "Member",
									value: ban.user.toString(),
									inline: true,
								},
							],
						},
						ban.user,
						ban.guild,
					),
				],
			});
		}
	}
}
