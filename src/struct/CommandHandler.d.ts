import { CommandHandlerOptions as AkairoCommandHandlerOptions } from "@ryukobot/discord-akairo";
import { Message } from "discord.js";
import Command from "./Command";

export type IgnoreCheckPredicate = (
	message: Message,
	command: Command,
) => boolean;

export interface CommandHandlerOptions
	extends Omit<AkairoCommandHandlerOptions, "ignorePermissions"> {
	ignorePermissions?: string | string[] | IgnoreCheckPredicate;
}
