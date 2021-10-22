import { CommandHandler as AkairoCommandHandler } from "@ryukobot/discord-akairo";
import { CommandHandlerOptions } from "./CommandHandler.d";
import Client from "./Client";

export default class CommandHandler extends AkairoCommandHandler {
	constructor(client: Client, options: CommandHandlerOptions) {
		// @ts-expect-error Ignoring this will give proper typedefs on our `ignorePermissions` string/function
		super(client, options);
	}
}
