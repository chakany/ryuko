import {
	Listener as AkairoListener,
	ListenerOptions,
} from "@ryukobot/discord-akairo";
import { MessageEmbedOptions, User, Guild } from "discord.js";
import Client from "./Client";
import Embed from "./Embed";

export default class Listener extends AkairoListener {
	public override client!: Client;

	embed(options: MessageEmbedOptions, user: User, guild: Guild) {
		return new Embed(options, user, guild);
	}
}
