import Listener from "../../struct/Listener";
import { GuildMember, TextChannel, Collection } from "discord.js";
import { time } from "@discordjs/builders";
import { replace } from "../../utils/command";

export default class MemberAddListener extends Listener {
	constructor() {
		super("guildMemberAdd", {
			emitter: "client",
			event: "guildMemberAdd",
		});
	}

	async exec(member: GuildMember) {
		if (
			await this.client.db.getCurrentUserMutes(member.id, member.guild.id)
		) {
			const muteRole = await member.guild.roles.fetch(
				this.client.settings.get(member.guild.id, "muteRole", null),
			);

			if (muteRole) member.roles.add(muteRole);
		}

		if (this.client.settings.get(member.guild.id, "joinLeave", false)) {
			const channel = (await member.guild.channels.fetch(
				this.client.settings.get(
					member.guild.id,
					"joinLeaveChannel",
					null,
				),
			)) as TextChannel | undefined;

			channel?.send(
				replace(
					this.client.settings.get(
						member.guild.id,
						"joinMessage",
						"",
					),
					member.user,
				),
			);
		}

		const ei = this.client.invites.get(member.guild.id);

		try {
			const guildInvites = await member.guild.invites.fetch();

			if (member.user.bot)
				return this.client.sendToLogChannel(member.guild, "member", {
					embeds: [
						this.embed(
							{
								title: "Member Joined",
								description: `They are member #${
									member.guild!.memberCount
								}!`,
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
										name: "Account Created",
										value: time(member.user.createdAt),
										inline: true,
									},
								],
							},
							member.user,
							member.guild,
						),
					],
				});

			const invites = new Collection<string, number>();

			for (const [key, invite] of guildInvites) {
				invites.set(key, invite.uses?.valueOf() || 0);
			}

			this.client.invites.set(member.guild.id, invites);

			// Look through the invites, find the one for which the uses went up.
			const invite = guildInvites.find(
				(i) => (ei?.get(i.code) || 0) < i.uses!,
			);

			return this.client.sendToLogChannel(member.guild, "member", {
				embeds: [
					this.embed(
						{
							title: "Member Joined",
							description: `They are member #${
								member.guild!.memberCount
							}!`,
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
									name: "Invited by",
									value:
										invite?.inviter?.toString() ||
										"Unknown",
									inline: true,
								},
								{
									name: "Invite Code",
									value: invite
										? `\`${invite?.code}\``
										: "None",
									inline: true,
								},
								{
									name: "Account Created",
									value: time(member.user.createdAt),
								},
							],
						},
						member.user,
						member.guild,
					),
				],
			});
		} catch (error) {
			return this.client.sendToLogChannel(member.guild, "member", {
				embeds: [
					this.embed(
						{
							title: "Member Joined",
							description: `They are member #${
								member.guild!.memberCount
							}!`,
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
									name: "Account Created",
									value: time(member.user.createdAt),
									inline: true,
								},
							],
						},
						member.user,
						member.guild,
					),
				],
			});
		}
	}
}
