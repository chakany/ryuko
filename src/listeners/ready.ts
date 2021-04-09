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
		console.log(`Logged in as ${this.client.user!.tag}`);
		this.client.user!.setActivity("BULKING SEASON", {
			type: "COMPETING",
		});
	}
}
