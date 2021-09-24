import Listener from "../../struct/Listener";

export default class ChannelCreateListener extends Listener {
	constructor() {
		super("channelCreate", {
			emitter: "client",
			event: "channelCreate",
		});
	}

	exec() {
		this.client.shard?.send("REFRESH_CHANNELS");
	}
}
