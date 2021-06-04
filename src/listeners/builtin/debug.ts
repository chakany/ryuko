import { Listener } from "discord-akairo";

export default class DebugListener extends Listener {
	constructor() {
		super("debug", {
			event: "debug",
			emitter: "client",
		});
	}

	exec(info: any) {
		this.client.log.debug(info);
	}
}
