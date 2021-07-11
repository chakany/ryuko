import { Listener } from "discord-akairo";

export default class UnhandledRejectionListener extends Listener {
	constructor() {
		super("unhandledRejection", {
			event: "unhandledRejection",
			emitter: "process",
		});
	}

	exec(error: any) {
		this.client.log.debug(error);
	}
}
