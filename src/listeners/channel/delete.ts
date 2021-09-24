import Listener from "../../struct/Listener";

export default class ChannelDeleteListener extends Listener {
	constructor() {
		super("channelDelete", {
			emitter: "client",
			event: "channelDelete",
		});
	}

	exec() {
		this.client.shard?.send("REFRESH_CHANNELS");
	}
}
