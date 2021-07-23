import { Listener } from "discord-akairo";
import { MessageEmbed, TextChannel, ActivityType } from "discord.js";
import schedule, { Job } from "node-schedule";
import axios from "axios";

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

		const guilds = await this.client.shard!.fetchClientValues(
			"guilds.cache.size"
		);

		const totalGuilds = guilds.reduce(
			(acc, guildCount) => acc + guildCount,
			0
		);

		// Set Discord Status
		const statuses =
			process.env.NODE_ENV !== "production"
				? [
						{
							type: "PLAYING",
							text: `Visual Studio Code`,
						},
				  ]
				: [
						{
							type: "WATCHING",
							text: `${totalGuilds} servers! | ${this.client.config.prefix}help`,
						},
						{
							type: "LISTENING",
							text: `your commands. | ${this.client.config.prefix}help`,
						},
						{
							type: "PLAYING",
							text: `with ${await this.client.shard!.fetchClientValues(
								"users.cache.size"
							)} members! | ${this.client.config.prefix}help`,
						},
						{
							type: "PLAYING",
							text: `https://ryuko.cc | ${this.client.config.prefix}help`,
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

		// Post status to bot lists
		// Only send if we in prod
		if (process.env.NODE_ENV == "production") {
			// discord.bots.gg
			axios.post(
				`https://discord.bots.gg/api/v1/bots/${
					this.client.user!.id
				}/stats`,
				{
					guildCount: this.client.guilds.cache.size,
					shardCount: this.client.shard!.count,
					shardId: this.client.guilds.cache.array()[0].shardID,
				},
				{
					headers: {
						Authorization: this.client.config.discord_bots_gg_token,
					},
				}
			);

			// discordbotlist.com
			axios.post(
				`https://discordbotlist.com/api/v1/bots/${
					this.client.user!.id
				}/stats`,
				{
					guilds: this.client.guilds.cache.size,
					users: this.client.users.cache.size,
					shard_id: this.client.guilds.cache.array()[0].shardID,
				},
				{
					headers: {
						Authorization:
							this.client.config.discordbotlist_com_token,
					},
				}
			);
		}
	}
}
