import { Listener, AkairoClient } from "discord-akairo";
import { Collection } from "discord.js";
import { MessageEmbed } from "discord.js";
import schedule, { Job } from "node-schedule";

const { prefix } = require("../../config.json");

export default class ReadyListener extends Listener {
	client: AkairoClient;

	constructor(client: AkairoClient) {
		super("ready", {
			emitter: "client",
			event: "ready",
		});

		this.client = client;
	}

	async exec() {
		const outer = this;
		// Schedule Jobs
		const mutes = await this.client.db.getMutedUsers();
		const jobs = this.client.jobs;
		mutes.forEach(async (mute: any) => {
			const cachedGuild = await outer.client.guilds.cache.get(mute.guild);
			if (!cachedGuild || jobs.get(mute.guild)?.get(mute.id)) return;
			const user = await cachedGuild?.members.fetch(mute.id);
			if (user === undefined) {
				return;
			}
			const muteRole = outer.client.settings.get(
				cachedGuild!.id,
				"muteRole",
				null
			);
			if (user!.roles.cache.has(muteRole)) {
				const job = schedule.scheduleJob(
					mute.expires,
					async function () {
						if (user!.roles.cache.has(muteRole))
							user.roles.remove(
								// @ts-expect-error
								cachedGuild?.roles.cache.get(muteRole)
							);

						outer.client.jobs
							.get(cachedGuild!.id)
							?.delete(user!.id);

						const logChannel = outer.client.settings.get(
							cachedGuild!.id,
							"loggingChannel",
							null
						);

						if (logChannel)
							cachedGuild?.channels.cache
								.get(`${logChannel}`)
								// @ts-ignore
								?.send(
									new MessageEmbed({
										title: "Member Unmuted",
										description: `${user}'s mute has expired.`,
										color: cachedGuild.me?.displayHexColor,
										timestamp: new Date(),
										footer: {
											text: outer.client.user?.tag,
											icon_url:
												outer.client.user?.displayAvatarURL(
													{
														dynamic: true,
													}
												),
										},
									})
								);
					}
				);

				this.client.jobs.set(
					mute.guild,
					new Collection<string, Job>().set(mute.id, job)
				);
			}
		});

		// Set Discord Status
		this.client.log.info(`${this.client.user!.username} is ready to roll!`);
		const serverCount: any = await this.client.shard!.fetchClientValues(
			"guilds.cache.size"
		);
		if (serverCount > 1) {
			this.client.user!.setActivity(
				`${serverCount} servers! | ${prefix}help`,
				{
					type: "WATCHING",
				}
			);
		} else {
			this.client.user!.setActivity(
				`${serverCount} server! | ${prefix}help`,
				{
					type: "WATCHING",
				}
			);
		}
	}
}
