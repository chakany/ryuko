import { Listener } from "discord-akairo";
import { MessageEmbed, TextChannel, ActivityType } from "discord.js";
import schedule, { Job } from "node-schedule";

export default class ReadyListener extends Listener {
	constructor() {
		super("ready", {
			emitter: "client",
			event: "ready",
		});
	}

	async exec() {
		const outer = this;

		// Schedule Jobs
		this.client.log.info("Scheduling Jobs");

		this.client.guilds.cache.forEach(async (g) => {
			// Get all guild invites, save to collection
			g.fetchInvites().then((guildInvites) => {
				this.client.invites.set(g.id, guildInvites);
			});

			// Get all members that are muted, check if they are still muted
			const muteRole = g.roles.cache.get(
				this.client.settings.get(g.id, "muteRole", null)
			);
			if (muteRole)
				for (const [probablyId, member] of muteRole.members) {
					const mute = await this.client.db.getCurrentUserMutes(
						member.id,
						g.id
					);
					if (!mute) member.roles.remove(muteRole);
					else if (mute) {
						const job = schedule.scheduleJob(
							mute.expires,
							function () {
								if (member.roles.cache.has(muteRole.id))
									// @ts-ignore
									member.roles.remove(muteRole);

								outer.client.jobs.get(g.id)?.delete(member.id);

								const logChannel = outer.client.settings.get(
									g.id,
									"loggingChannel",
									null
								);

								if (
									logChannel &&
									outer.client.settings.get(
										g.id,
										"logging",
										false
									)
								)
									(<TextChannel>(
										g.channels.cache.get(`${logChannel}`)
									))?.send(
										new MessageEmbed({
											title: "Member Unmuted",
											description: `${member}'s mute has expired.`,
											color: g.me?.displayHexColor,
											timestamp: new Date(),
										})
									);
							}
						);
						outer.client.jobs.get(g.id)?.set(member.id, job);
					}
				}
		});

		this.client.log.info(`${this.client.user!.username} is ready to roll!`);

		// Set Discord Status
		const statuses = [
			{
				type: "WATCHING",
				text: `${await this.client.shard!.fetchClientValues(
					"guilds.cache.size"
				)} servers! | ${this.client.config.prefix}help`,
			},
			{
				type: "PLAYING",
				text: `with ${await this.client.shard!.fetchClientValues(
					"users.cache.size"
				)} members! | ${this.client.config.prefix}help`,
			},
			{
				type: "PLAYING",
				text: `with deez | ${this.client.config.prefix}help`,
			},
		];
		let i = 0;
		setInterval(() => {
			if (i + 1 == statuses.length) i = 0;
			else i++;

			this.client.user!.setActivity(statuses[i].text, {
				type: <ActivityType>statuses[i].type,
			});
		}, 15000);
	}
}
