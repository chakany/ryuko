import Listener from "../../struct/Listener";
import { Guild } from "discord.js";

export default class GuildCreateListener extends Listener {
	constructor() {
		super("guildCreate", {
			emitter: "client",
			event: "guildCreate",
		});
	}

	exec(guild: Guild) {
		this.client.log.info(
			`I was added to guild "${guild.name}" that is owned by ${
				this.client.users.cache.get(guild.ownerId)?.tag
			}`
		);
	}
}
