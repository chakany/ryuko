import { Listener, AkairoClient } from "discord-akairo";
import { GuildMember, MessageEmbed } from "discord.js";

export default class LeaveListener extends Listener {
	client: AkairoClient;

	constructor(client: AkairoClient) {
		super("memberLeave", {
			emitter: "client",
			event: "guildMemberRemove",
		});

		this.client = client;
	}

	async exec(member: GuildMember) {
		try {
			const logChannel = this.client.settings.get(
				member.guild.id,
				"loggingChannel",
				"None"
			);
			if (logChannel === "None") return;

			const fetchedLogs = await member.guild.fetchAuditLogs({
				limit: 1,
				type: "MEMBER_KICK",
			});
			// Since we only have 1 audit log entry in this collection, we can simply grab the first one
			const kickLog = fetchedLogs.entries.first();

			// Let's perform a coherence check here and make sure we got *something*
			if (!kickLog)
				return (
					// @ts-expect-error
					this.client.channels.cache
						.get(logChannel)
						// @ts-expect-error
						.send(
							new MessageEmbed({
								title: "Member Left",
								description:
									"`" +
									// @ts-expect-error
									target.tag +
									"` (`" +
									// @ts-expect-error
									target.id +
									"`) left the server.",
								color: member.guild?.me?.displayHexColor,
								timestamp: new Date(),
								// @ts-ignore
								thumbnail: target.displayAvatarURL({
									dynamic: true,
								}),
								footer: {
									text: this.client.user?.tag,
									icon_url:
										this.client.user?.displayAvatarURL({
											dynamic: true,
										}),
								},
							})
						)
				);
			// We now grab the user object of the person who kicked our member
			// Let us also grab the target of this action to double-check things
			const { executor, target } = kickLog;
			if (executor.id === this.client.user!.id) return;
			// @ts-ignore
			if (target!.id === member.id) {
				return (
					// @ts-ignore
					this.client.channels.cache
						.get(logChannel)
						// @ts-ignore
						.send(
							new MessageEmbed({
								title: "Member Kicked",
								description:
									"`" +
									// @ts-expect-error
									target.tag +
									"` (`" +
									// @ts-expect-error
									target.id +
									"`) was kicked.",
								color: member.guild?.me?.displayHexColor,
								timestamp: new Date(),
								// @ts-ignore.displayAvatarURL({ dynamic: true })
								thumbnail: target.displayAvatarURL({
									dynamic: true,
								}),
								author: {
									name:
										executor.tag + " (" + executor.id + ")",
									icon_url: executor.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {
									text: this.client.user?.tag,
									icon_url:
										this.client.user?.displayAvatarURL({
											dynamic: true,
										}),
								},
							})
						)
				);
			} else {
				return (
					// @ts-ignore
					this.client.channels.cache
						.get(logChannel)
						// @ts-ignore
						.send(
							new MessageEmbed({
								title: "Member Kicked",
								description:
									"`" +
									// @ts-expect-error
									target.tag +
									"` (`" +
									// @ts-expect-error
									target.id +
									"`) was kicked.",
								color: member.guild?.me?.displayHexColor,
								timestamp: new Date(),
								// @ts-ignore
								thumbnail: target.displayAvatarURL({
									dynamic: true,
								}),
								footer: {
									text: `I couldn't find who kicked this member\n${this.client.user?.tag}`,
									icon_url:
										this.client.user?.displayAvatarURL({
											dynamic: true,
										}),
								},
							})
						)
				);
			}
		} catch (error) {
			this.client.log.error(error);
		}
	}
}
