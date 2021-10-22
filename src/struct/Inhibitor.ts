import { Inhibitor as AkairoInhibitor } from "@ryukobot/discord-akairo";
import Client from "./Client";

export default class Inhibitor extends AkairoInhibitor {
	public override client!: Client;
}
