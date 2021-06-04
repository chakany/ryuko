import { Listener } from "discord-akairo";

export default class WarnListener extends Listener {
	constructor() {
		super("warn", {
			event: "warn",
			emitter: "client",
		});
	}

	exec(warning: any) {
		this.client.log.warn(warning);
	}
}
