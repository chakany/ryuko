import Listener from "../../struct/Listener";
import { Guild } from "discord.js";

export default class GuildDeleteListener extends Listener {
	constructor() {
		super("guildDelete", {
			emitter: "client",
			event: "guildDelete",
		});
	}

	async exec(guild: Guild) {
		this.client.log.info(
			`I was removed from guild "${guild.name}" that is owned by ${
				(await this.client.users.fetch(guild.ownerId))?.tag
			}`
		);
	}
}
