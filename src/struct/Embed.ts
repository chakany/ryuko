import { MessageEmbed, MessageEmbedOptions, User, Guild } from "discord.js";

export default class Embed extends MessageEmbed {
	constructor(options: MessageEmbedOptions, user: User, guild: Guild) {
		options.footer ??= {
			text: user.tag || "",
			iconURL: user.displayAvatarURL({ dynamic: true }) || "",
		};

		options.color ??= guild.me?.displayHexColor;

		super(options);
	}
}
