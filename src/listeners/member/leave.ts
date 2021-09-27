import Listener from "../../struct/Listener";
import { GuildMember, TextChannel, User } from "discord.js";
import { replace } from "../../utils/command";

export default class MemberLeaveListener extends Listener {
	constructor() {
		super("guildMemberRemove", {
			emitter: "client",
			event: "guildMemberRemove",
		});
	}

	async exec(member: GuildMember) {
		if (this.client.settings.get(member.guild.id, "joinLeave", false)) {
			const channel = (await member.guild.channels.fetch(
				this.client.settings.get(
					member.guild.id,
					"joinLeaveChannel",
					null
				)
			)) as TextChannel | undefined;

			channel?.send(
				replace(
					this.client.settings.get(
						member.guild.id,
						"leaveMessage",
						""
					),
					member.user
				)
			);
		}

		const fetchedLogs = await member.guild.fetchAuditLogs({
			limit: 1,
			type: "MEMBER_KICK",
		});

		const kickLog = fetchedLogs.entries.first();

		if (!kickLog)
			return this.client.sendToLogChannel(
				{
					embeds: [
						this.embed(
							{
								title: "Member Left",
								thumbnail: {
									url: member.user.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Member",
										value: member.toString(),
									},
								],
							},
							member.user,
							member.guild
						),
					],
				},
				member.guild
			);

		const { executor, target } = kickLog;
		if (executor?.id === this.client.user!.id) return;

		if ((<User>target).id === member.id) {
			return this.client.sendToLogChannel(
				{
					embeds: [
						this.embed(
							{
								title: "Member Kicked",
								thumbnail: {
									url: member.user.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Member",
										value: member.toString(),
										inline: true,
									},
									{
										name: "Kicked by",
										value:
											executor?.toString() || "Unknown",
										inline: true,
									},
								],
							},
							member.user,
							member.guild
						),
					],
				},
				member.guild
			);
		} else {
			return this.client.sendToLogChannel(
				{
					embeds: [
						this.embed(
							{
								title: "Member Left",
								thumbnail: {
									url: member.user.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Member",
										value: member.toString(),
									},
								],
							},
							member.user,
							member.guild
						),
					],
				},
				member.guild
			);
		}
	}
}
