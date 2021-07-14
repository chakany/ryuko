import { Listener } from "discord-akairo";
import { Guild } from "discord.js";

export default class GuildDeleteListener extends Listener {
	constructor() {
		super("guildDelete", {
			emitter: "client",
			event: "guildDelete",
		});
	}

	exec(guild: Guild) {
		this.client.log.info(
			`I was removed from guild "${guild.name}" that is owned by ${guild.owner?.user.tag}`
		);
	}
}
