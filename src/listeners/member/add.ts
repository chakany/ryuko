import Listener from "../../struct/Listener";
import { GuildMember, MessageEmbed, TextChannel, User } from "discord.js";

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
			const muteRole = member.guild.roles.cache.get(
				this.client.settings.get(member.guild.id, "muteRole", null)
			);

			if (muteRole) member.roles.add(muteRole);
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
					(i) => ei.get(i.code).uses < i.uses!
				);

				return this.client.sendToLogChannel(
					{
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
					},
					member.guild
				);
			})
			.catch((error: any) => {
				return this.client.sendToLogChannel(
					{
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
					},
					member.guild
				);
			});
	}
}
