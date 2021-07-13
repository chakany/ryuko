import { Listener } from "discord-akairo";
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
			`I was added to guild "${guild.name}" that is owned by ${guild.owner?.user.tag}`
		);
	}
}
