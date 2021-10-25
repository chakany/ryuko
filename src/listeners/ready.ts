import Listener from "../struct/Listener";
import Client from "../struct/Client";
import { ActivityType, Collection } from "discord.js";
import axios from "axios";
import moment from "moment";
import { setMute } from "../utils/command";

export default class ReadyListener extends Listener {
	constructor() {
		super("ready", {
			emitter: "client",
			event: "ready",
		});
	}

	async exec() {
		// Output total modules loaded for each handler
		this.client.log.info(
			`Loaded ${this.client.commandHandler.modules.size} Commands`,
		);
		this.client.log.info(
			`Loaded ${this.client.listenerHandler.modules.size} Listeners`,
		);
		this.client.log.info(
			`Loaded ${this.client.inhibitorHandler.modules.size} Inhibitors`,
		);

		// Schedule Jobs
		this.client.log.info("Scheduling Jobs");

		this.client.guilds.cache.forEach(async (g) => {
			// Get all guild invites, save to collection()
			g.invites
				.fetch()
				.then((guildInvites) => {
					const invites = new Collection<string, number>();

					for (const [key, invite] of guildInvites) {
						invites.set(key, invite.uses?.valueOf() || 0);
					}

					this.client.invites.set(g.id, invites);
				})
				.catch();

			// Get all members that are muted, check if they are still muted
			const muteRole = await g.roles.fetch(
				this.client.settings.get(g.id, "muteRole", "123123"),
			);
			if (muteRole)
				for (const [probablyId, member] of muteRole.members) {
					const mute = await this.client.db.getCurrentUserMutes(
						member.id,
						g.id,
					);
					if (!mute) member.roles.remove(muteRole);
					else if (mute) {
						setMute(
							this.client as unknown as Client,
							g,
							member,
							await g.members.fetch(mute.adminId),
							muteRole.id,
							moment(mute.expires),
							mute.reason,
						);
					}
				}
		});

		this.client.log.info(`${this.client.user!.username} is ready to roll!`);

		const guilds = await this.client.shard!.fetchClientValues(
			"guilds.cache.size",
		);

		const totalGuilds = guilds.reduce(
			(acc: any, guildCount: any) => acc + guildCount,
			0,
		);

		// Set Discord Status
		const statuses: Array<{
			type: Exclude<ActivityType, "CUSTOM">;
			text: string;
		}> =
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
							text: `https://bizkitbot.com | ${this.client.config.prefix}help`,
						},
				  ];
		let i = 0;
		setInterval(() => {
			if (i + 1 == statuses.length) i = 0;
			else i++;

			this.client.user!.setActivity(statuses[i].text, {
				type: statuses[i].type,
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
					shardId: this.client.guilds.cache.first()?.shardId,
				},
				{
					headers: {
						Authorization: this.client.config.discord_bots_gg_token,
					},
				},
			);

			// discordbotlist.com
			axios.post(
				`https://discordbotlist.com/api/v1/bots/${
					this.client.user!.id
				}/stats`,
				{
					guilds: this.client.guilds.cache.size,
					users: this.client.users.cache.size,
					shard_id: this.client.guilds.cache.first()?.shardId,
				},
				{
					headers: {
						Authorization:
							this.client.config.discordbotlist_com_token,
					},
				},
			);
		}
	}
}
