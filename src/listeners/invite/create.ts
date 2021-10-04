import Listener from "../../struct/Listener";
import { Invite, Collection } from "discord.js";

export default class InviteCreateListener extends Listener {
	constructor() {
		super("inviteCreate", {
			emitter: "client",
			event: "inviteCreate",
		});
	}

	exec(invite: Invite) {
		if (!this.client.invites.has(invite.guild!.id))
			this.client.invites.set(invite.guild!.id, new Collection());

		this.client.invites
			.get(invite.guild!.id)
			?.set(invite.code, invite.uses?.valueOf() || 0);
	}
}
