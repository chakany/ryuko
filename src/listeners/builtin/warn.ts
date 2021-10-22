import Listener from "../../struct/Listener";

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
