import Command from "../../struct/Command";
import { defaultReplyMember } from "../../utils/command";
import { GuildMember, Message } from "discord.js";

export default class AvatarCommand extends Command {
	constructor() {
		super("avatar", {
			aliases: ["avatar", "ava", "pfp", "av"],
			description: "Get a member's avatar",
			category: "Utility",

			args: [
				{
					id: "member",
					type: "member",
					default: defaultReplyMember,
				},
			],
		});
	}

	async exec(message: Message, args: any) {
		message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${args.member.user.tag}'s Avatar`,
						image: {
							url: (<GuildMember>(
								args.member
							)).user.displayAvatarURL({
								dynamic: true,
							}),
						},
					},
					message,
				),
			],
		});
	}
}
