import Listener from "../../struct/Listener";
import { Guild } from "discord.js";

export default class GuildCreateListener extends Listener {
	constructor() {
		super("guildCreate", {
			emitter: "client",
			event: "guildCreate",
		});
	}

	async exec(guild: Guild) {
		this.client.shard?.send("REFRESH_GUILDS");

		guild.invites.fetch().then((guildInvites) => {
			this.client.invites.set(guild.id, guildInvites);
		});

		this.client.log.info(
			`I was added to guild "${guild.name}" that is owned by ${
				(await this.client.users.fetch(guild.ownerId))?.tag
			}`
		);
	}
}
