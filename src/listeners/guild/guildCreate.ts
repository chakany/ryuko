import { Listener } from "discord-akairo";
import { Guild } from "discord.js";

export default class GuildCreateListener extends Listener {
	constructor() {
		super("guildCreate", {
			event: "guildCreate",
			emitter: "client",
		});
	}

	exec(guild: Guild) {}
}
