import { Listener } from "discord-akairo";

export default class UnhandledRejectionListener extends Listener {
	constructor() {
		super("unhandledRejection", {
			event: "unhandledRejection",
			emitter: "process",
		});
	}

	exec(error: any) {
		if (error.code != 50013) this.client.log.error(error);
	}
}
