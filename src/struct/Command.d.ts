import { CommandOptions as AkairoCommandOptions } from "@ryukobot/discord-akairo";

export interface CommandOptions extends AkairoCommandOptions {
	modOnly?: boolean;
	adminOnly?: boolean;
	nsfw?: boolean;
	guild?: string[];
}
