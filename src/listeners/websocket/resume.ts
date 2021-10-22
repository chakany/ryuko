import Listener from "../../struct/Listener";

export default class ResumeListener extends Listener {
	constructor() {
		super("resume", {
			event: "resume",
			emitter: "client",
		});
	}

	exec(events: any) {
		this.client.log.info(`Resumed Gateway connection, Replaying ${events}`);
	}
}
