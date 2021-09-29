import Listener from "../../struct/Listener";
import { GuildMember, TextChannel } from "discord.js";
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
				this.client.settings.get(member.guild.id, "muteRole", null)
			);

			if (muteRole) member.roles.add(muteRole);
		}

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
						"joinMessage",
						""
					),
					member.user
				)
			);
		}

		member.guild.invites
			.fetch()
			.then((guildInvites) => {
				// This is the *existing* invites for the guild.
				const ei = this.client.invites.get(member.guild.id);

				// Update the cached invites
				this.client.invites.set(member.guild.id, guildInvites);

				// Look through the invites, find the one for which the uses went up.
				const invite = guildInvites.find(
					(i) => (ei?.get(i.code)?.uses || 0) < i.uses!
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
								],
							},
							member.user,
							member.guild
						),
					],
				});
			})
			.catch((error: any) => {
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
								],
							},
							member.user,
							member.guild
						),
					],
				});
			});
	}
}
