import Command from "../../struct/Command";
import { Message, GuildMember } from "discord.js";

export default class DoasCommand extends Command {
	constructor() {
		super("doas", {
			aliases: ["doas", "sudo"],
			description: "Run a command as another member",
			category: "Owner",
			ownerOnly: true,
			args: [
				{
					id: "member",
					type: "member",
				},
				{
					id: "command",
					type: "commandAlias",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.member)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide a member to run the command as!"
				)
			);

		if (!args.command)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide a command to run!"
				)
			);

		let newMessage = message;

		Object.defineProperty(newMessage, "member", {
			value: args.member,
		});

		newMessage.author = (<GuildMember>args.member).user;

		newMessage.content = message.content.replace(
			/.+(\>) /,
			message.util?.parsed?.prefix!
		);

		this.handler.handle(newMessage);
	}
}
