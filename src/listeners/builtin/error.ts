import Listener from "../../struct/Listener";

export default class ErrorListener extends Listener {
	constructor() {
		super("error", {
			event: "error",
			emitter: "client",
		});
	}

	exec(error: any) {
		this.client.log.error(error);
	}
}
