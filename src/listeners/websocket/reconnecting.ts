import Listener from "../../struct/Listener";

export default class ReconnectingListener extends Listener {
	constructor() {
		super("reconnecting", {
			event: "reconnecting",
			emitter: "client",
		});
	}

	exec(events: any) {
		this.client.log.warn(`Attempting reconnection to Gateway`);
	}
}
