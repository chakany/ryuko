import Command from "../../struct/Command";
import { defaultReplyMember } from "../../utils/command";
import { GuildMember, Message } from "discord.js";

export default class BannerCommand extends Command {
	constructor() {
		super("banner", {
			aliases: ["banner", "ba"],
			description: "Get a member's banner",
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
		await (<GuildMember>args.member).user.fetch(true);

		const bannerUrl = (<GuildMember>args.member).user.bannerURL({
			dynamic: true,
			size: 512,
		});

		if (!bannerUrl)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Member",
						"That Member does not have a banner!",
					),
				],
			});

		message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${args.member.user.tag}'s Banner`,
						image: {
							url: bannerUrl || "",
						},
					},
					message,
				),
			],
		});
	}
}
