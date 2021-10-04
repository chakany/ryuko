import Listener from "../../struct/Listener";
import { Guild, Collection } from "discord.js";

export default class GuildCreateListener extends Listener {
	constructor() {
		super("guildCreate", {
			emitter: "client",
			event: "guildCreate",
		});
	}

	async exec(guild: Guild) {
		guild.invites.fetch().then((guildInvites) => {
			const invites = new Collection<string, number>();

			for (const [key, invite] of guildInvites) {
				invites.set(key, invite.uses?.valueOf() || 0);
			}

			this.client.invites.set(guild.id, invites);
		});

		this.client.log.info(
			`I was added to guild "${guild.name}" that is owned by ${
				(await this.client.users.fetch(guild.ownerId))?.tag
			}`,
		);
	}
}
