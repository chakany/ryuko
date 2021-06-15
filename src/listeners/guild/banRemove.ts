import { Listener } from "discord-akairo";
import { Guild, User, TextChannel, MessageEmbed } from "discord.js";

export default class GuildBanRemoveListener extends Listener {
	constructor() {
		super("guildBanRemove", {
			event: "guildBanRemove",
			emitter: "client",
		});
	}

	async exec(guild: Guild, user: User) {
		const logChannelId = this.client.settings.get(
			guild.id,
			"loggingChannel",
			null
		);

		if (
			!logChannelId ||
			!this.client.settings.get(guild.id, "logging", false)
		)
			return;

		const logChannel = <TextChannel>guild.channels.cache.get(logChannelId);

		const fetchedLogs = await guild.fetchAuditLogs({
			limit: 1,
			type: "MEMBER_BAN_REMOVE",
		});

		const banLog = fetchedLogs.entries.first();

		if (!banLog)
			return logChannel.send(
				new MessageEmbed({
					title: "Member Unbanned",
					thumbnail: {
						url: user.displayAvatarURL({
							dynamic: true,
						}),
					},
					color: guild.me?.displayHexColor,
					timestamp: new Date(),
					fields: [
						{
							name: "Member",
							value: user,
							inline: true,
						},
					],
				})
			);

		const { executor, target } = banLog;

		if ((<User>target).id === user.id) {
			return logChannel.send(
				new MessageEmbed({
					title: "Member Unbanned",
					thumbnail: {
						url: user.displayAvatarURL({
							dynamic: true,
						}),
					},
					color: guild.me?.displayHexColor,
					timestamp: new Date(),
					fields: [
						{
							name: "Member",
							value: user,
							inline: true,
						},
						{
							name: "Unbanned By",
							value: executor,
							inline: true,
						},
					],
				})
			);
		} else {
			return logChannel.send(
				new MessageEmbed({
					title: "Member Unbanned",
					thumbnail: {
						url: user.displayAvatarURL({
							dynamic: true,
						}),
					},
					color: guild.me?.displayHexColor,
					timestamp: new Date(),
					fields: [
						{
							name: "Member",
							value: user,
							inline: true,
						},
					],
				})
			);
		}
	}
}
