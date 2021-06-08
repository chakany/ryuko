import { Listener } from "discord-akairo";
import { GuildMember, MessageEmbed, TextChannel, User } from "discord.js";

export default class MemberAddListener extends Listener {
	constructor() {
		super("guildMemberAdd", {
			emitter: "client",
			event: "guildMemberAdd",
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

		const logChannel = <TextChannel>(
			member.guild!.channels.cache.get(logChannelId)
		);

		member.guild.fetchInvites().then((guildInvites) => {
			// This is the *existing* invites for the guild.
			const ei = this.client.invites.get(member.guild.id);

			// Update the cached invites
			this.client.invites.set(member.guild.id, guildInvites);

			// Look through the invites, find the one for which the uses went up.
			const invite = guildInvites.find(
				(i) => ei.get(i.code).uses < i.uses!
			);

			console.log(invite?.code);
			return logChannel.send(
				new MessageEmbed({
					title: "Member Joined",
					thumbnail: {
						url: member.user.displayAvatarURL({ dynamic: true }),
					},
					color: member.guild.me?.displayHexColor,
					timestamp: new Date(),
					fields: [
						{
							name: "Member",
							value: member,
							inline: true,
						},
						{
							name: "Invited by",
							value: invite?.inviter,
							inline: true,
						},
						{
							name: "Invite Code",
							value: `\`${invite?.code}\``,
							inline: true,
						},
					],
				})
			);
		});
	}
}
