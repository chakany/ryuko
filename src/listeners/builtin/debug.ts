import Listener from "../../struct/Listener";

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
