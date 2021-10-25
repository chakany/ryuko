import Listener from "../../struct/Listener";
import { GuildBan, User } from "discord.js";

export default class GuildBanRemoveListener extends Listener {
	constructor() {
		super("guildBanRemove", {
			event: "guildBanRemove",
			emitter: "client",
		});
	}

	async exec(ban: GuildBan) {
		const fetchedLogs = await ban.guild
			.fetchAuditLogs({
				limit: 1,
				type: "MEMBER_BAN_REMOVE",
			})
			.catch();

		const banLog = fetchedLogs.entries.first();

		if (!banLog)
			return this.client.sendToLogChannel(ban.guild, "member", {
				embeds: [
					this.embed(
						{
							title: "Member Unbanned",
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
							title: "Member Unbanned",
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
									name: "Unbanned By",
									value: executor!.toString(),
									inline: true,
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
							title: "Member Unbanned",
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
