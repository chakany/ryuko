import { Listener } from "discord-akairo";
import { Guild } from "discord.js";

export default class GuildRemoveListener extends Listener {
	constructor() {
		super("guildRemove", {
			emitter: "client",
			event: "guildRemove",
		});
	}

	exec(guild: Guild) {
		this.client.log.info(
			`I was removed from guild "${guild.name}" that is owned by ${guild.owner?.user.tag}`
		);
	}
}
