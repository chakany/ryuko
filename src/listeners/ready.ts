import { Listener, AkairoClient } from "discord-akairo";
import { Client } from "discord.js";

export default class ReadyListener extends Listener {
	client: AkairoClient;

	constructor(client: AkairoClient) {
		super("ready", {
			emitter: "client",
			event: "ready",
		});

		this.client = client;
	}

	exec() {
		this.client.log.info(`${this.client.user!.username} is ready to roll!`);
		this.client.user!.setActivity("BULKING SEASON", {
			type: "COMPETING",
		});
	}
}
