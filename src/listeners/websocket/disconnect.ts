import Listener from "../../struct/Listener";

export default class DisconnectListener extends Listener {
	constructor() {
		super("disconnect", {
			event: "disconnect",
			emitter: "client",
		});
	}

	exec(event: any) {
		this.client.log.error("Disconnected from Gateway");
	}
}
