import { PermissionResolvable } from "discord.js";
import { MissingPermissionSupplier } from "@ryukobot/discord-akairo";

export type Permissions =
	| PermissionResolvable
	| PermissionResolvable[]
	| MissingPermissionSupplier;

export interface Command {
	id: string;
	aliases: string[];
	description: string;
	ownerOnly: boolean;
	adminOnly: boolean;
	modOnly: boolean;
	clientPermissions?: Permissions;
	userPermissions?: Permissions;
	cooldown: string | null;
	usage: string;
}
