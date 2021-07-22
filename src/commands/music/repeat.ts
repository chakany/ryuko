import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class RepeatCommand extends Command {
	constructor() {
		super("repeat", {
			aliases: ["repeat", "loop"],
			description: "Loops the currently playing song",
			category: "Music",

			args: [
				{
					id: "on|off",
					type: "string",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const option = args["on|off"];
		const serverQueue = this.client.queue.get(message.guild!.id);
		if (serverQueue === undefined)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"There is no song currently playing"
				)
			);
		if (
			!message.member?.voice.channel ||
			message.member?.voice.channelID !==
				serverQueue.player?.voiceConnection.voiceChannelID
		)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"You have to be in the voice channel to loop the song!"
				)
			);
		switch (option) {
			case "on":
				serverQueue.loop = true;
				break;
			case "off":
				serverQueue.loop = false;
				break;
			default:
				if (serverQueue.loop) serverQueue.loop = false;
				else serverQueue.loop = true;
		}
		return message.channel.send(
			new MessageEmbed({
				title: "Repeat",
				description: `Looping is **${
					serverQueue.loop ? "Enabled" : "Disabled"
				}**`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			})
		);
	}
}
