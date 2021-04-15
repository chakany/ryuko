import { Listener, AkairoClient } from "discord-akairo";

const { prefix } = require("../../config.json");

export default class ReadyListener extends Listener {
	client: AkairoClient;

	constructor(client: AkairoClient) {
		super("ready", {
			emitter: "client",
			event: "ready",
		});

		this.client = client;
	}

	async exec() {
		this.client.log.info(`${this.client.user!.username} is ready to roll!`);
		const serverCount: any = await this.client.shard!.fetchClientValues(
			"guilds.cache.size"
		);
		if (serverCount > 1) {
			this.client.user!.setActivity(`${serverCount} servers! | ${prefix}help`, {
				type: "WATCHING",
			});
		} else {
			this.client.user!.setActivity(`${serverCount} server! | ${prefix}help`, {
				type: "WATCHING",
			});
		}
	}
}
