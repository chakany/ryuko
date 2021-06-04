import { Listener } from "discord-akairo";
import { GuildMember, MessageEmbed, TextChannel, User } from "discord.js";

export default class MemberLeaveListener extends Listener {
	constructor() {
		super("guildMemberRemove", {
			emitter: "client",
			event: "guildMemberRemove",
		});
	}

	async exec(member: GuildMember) {
		const logChannelId = this.client.settings.get(
			member.guild.id,
			"loggingChannel",
			null
		);
		if (
			!logChannelId ||
			!this.client.settings.get(member.guild!.id, "logging", false)
		)
			return;

		const fetchedLogs = await member.guild.fetchAuditLogs({
			limit: 1,
			type: "MEMBER_KICK",
		});

		const kickLog = fetchedLogs.entries.first();

		const logChannel = <TextChannel>(
			member.guild!.channels.cache.get(logChannelId)
		);

		if (!kickLog)
			return logChannel.send(
				new MessageEmbed({
					title: "Member Left",
					thumbnail: {
						url: member.user.displayAvatarURL({ dynamic: true }),
					},
					color: member.guild.me?.displayHexColor,
					timestamp: new Date(),
					fields: [
						{
							name: "Member",
							value: member,
						},
					],
				})
			);

		const { executor, target } = kickLog;
		if (executor.id === this.client.user!.id) return;

		if ((<User>target).id === member.id) {
			return logChannel.send(
				new MessageEmbed({
					title: "Member Kicked",
					thumbnail: {
						url: member.user.displayAvatarURL({ dynamic: true }),
					},
					color: member.guild.me?.displayHexColor,
					timestamp: new Date(),
					author: {
						name: (<User>executor).tag,
						icon_url: (<User>executor).displayAvatarURL({
							dynamic: true,
						}),
						url: `https://discord.com/users/${(<User>executor).id}`,
					},
					fields: [
						{
							name: "Member",
							value: member,
							inline: true,
						},
						{
							name: "Kicked by",
							value: <User>executor,
							inline: true,
						},
					],
				})
			);
		} else {
			return logChannel.send(
				new MessageEmbed({
					title: "Member Left",
					thumbnail: {
						url: member.user.displayAvatarURL({ dynamic: true }),
					},
					color: member.guild.me?.displayHexColor,
					timestamp: new Date(),
					fields: [
						{
							name: "Member",
							value: member,
						},
					],
				})
			);
		}
	}
}
