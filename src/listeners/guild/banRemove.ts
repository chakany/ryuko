import Listener from "../../struct/Listener";
import { Guild, User, TextChannel, MessageEmbed } from "discord.js";

export default class GuildBanRemoveListener extends Listener {
	constructor() {
		super("guildBanRemove", {
			event: "guildBanRemove",
			emitter: "client",
		});
	}

	async exec(guild: Guild, user: User) {
		const fetchedLogs = await guild.fetchAuditLogs({
			limit: 1,
			type: "MEMBER_BAN_REMOVE",
		});

		const banLog = fetchedLogs.entries.first();

		if (!banLog)
			return this.client.sendToLogChannel(guild, "member", {
				embeds: [
					this.embed(
						{
							title: "Member Unbanned",
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
						guild,
					),
				],
			});

		const { executor, target } = banLog;

		if (executor == guild.me?.user) return;

		if ((<User>target).id === user.id) {
			return this.client.sendToLogChannel(guild, "member", {
				embeds: [
					this.embed(
						{
							title: "Member Unbanned",
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
									name: "Unbanned By",
									value: executor!.toString(),
									inline: true,
								},
							],
						},
						user,
						guild,
					),
				],
			});
		} else {
			return this.client.sendToLogChannel(guild, "member", {
				embeds: [
					this.embed(
						{
							title: "Member Unbanned",
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
						guild,
					),
				],
			});
		}
	}
}
