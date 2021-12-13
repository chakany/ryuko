import Listener from "../../struct/Listener";
export default class UnhandledRejectionListener extends Listener {
	constructor() {
		super("unhandledRejection", {
			event: "unhandledRejection",
			emitter: "process",
		});
	}

	exec(error: any) {
		if (error.code && error.code == 50013) { return; }
		this.client.log.error(error);
	}
}
