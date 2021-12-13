import Listener from "../../struct/Listener";

export default class ErrorListener extends Listener {
	constructor() {
		super("error", {
			event: "error",
			emitter: "client",
		});
	}

	exec(error: any) {
		if (error.code == 50013) { return; }
		this.client.log.error(error);
	}
}
