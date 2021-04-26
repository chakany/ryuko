import { Listener, AkairoClient } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import schedule from "node-schedule";
import db from "../utils/db";

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
		const guilds = await db.getMutedUsers();
		for (const [guild, muted] of guilds) {
			let current = outer.client.settings.get(guild, "mutedUsers", null);
			if (typeof current === "string") current = new Map(JSON.parse(current));
			else current = new Map(current);
			let guildJobs = new Map();
			for (const [id, expiry] of muted) {
				const expires = new Date(expiry);
				if (expires <= new Date()) {
					current.delete(id);
				} else {
					const job = schedule.scheduleJob(expires, async function () {
						const cachedGuild = await outer.client.guilds.cache.get(guild);

						const user = await cachedGuild?.members.fetch(id);
						if (user === undefined) {
							// Remove the user from DB.
						}
						const muteRole = outer.client.settings.get(
							cachedGuild!.id,
							"muteRole",
							null
						);
						if (user!.roles.cache.has(muteRole))
							// @ts-ignore
							user.roles.remove(cachedGuild?.roles.cache.get(muteRole));

						outer.client.jobs.get(cachedGuild!.id)?.delete(user!.id);
						let cachedMutes = outer.client.settings.get(
							cachedGuild!.id,
							"mutedUsers",
							null
						);
						if (typeof cachedMutes === "string")
							cachedMutes = new Map(JSON.parse(cachedMutes));
						else cachedMutes = new Map(cachedMutes);

						cachedMutes.delete(id);

						outer.client.settings.set(
							guild,
							"mutedUsers",
							// @ts-ignore
							JSON.stringify([...cachedMutes])
						);

						const logChannel = outer.client.settings.get(
							guild,
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
										color: 16716032,
										timestamp: new Date(),
										footer: {
											text: outer.client.user?.tag,
											icon_url:
												outer.client.user?.avatarURL({ dynamic: true }) || "",
										},
									})
								);
					});
					guildJobs.set(id, job);
				}
				this.client.jobs.set(guild, guildJobs);
				this.client.settings.set(
					guild,
					"mutedUsers",
					// @ts-ignore
					JSON.stringify([...current])
				);
			}
		}

		// Set Discord Status
		this.client.log.info(`${this.client.user!.username} is ready to roll!`);
		const serverCount: any = await this.client.shard!.fetchClientValues(
			"guilds.cache.size"
		);
		if (serverCount > 1) {
			this.client.user!.setActivity(`${serverCount} servers! | ${prefix}help`, {
				type: "WATCHING",
			});
		} else {
			this.client.user!.setActivity(`${serverCount} server! | ${prefix}help`, {
				type: "WATCHING",
			});
		}
	}
}
