import { Listener as AkairoListener, ListenerOptions } from "discord-akairo";
import { MessageEmbedOptions, User, Guild } from "discord.js";
import Embed from "./Embed";

export default class Listener extends AkairoListener {
	constructor(id: string, options?: ListenerOptions) {
		super(id, options);
	}

	embed(options: MessageEmbedOptions, user: User, guild: Guild) {
		return new Embed(options, user, guild);
	}
}
