# Commands
Adding a new command is a breeze, you just need to know *how*.

For this, we will use our ping command.

```ts
import { Command } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";

export default class PingCommand extends Command {
	constructor() {
		super("ping", {
			aliases: ["ping"],
			description: "Check bot latency",
			category: "Utility",
		});
	}

	async exec(message: Message) {
		return message.channel.send(
			new MessageEmbed({
				title: "Pong!",
				color: 16716032,
				timestamp: new Date(),
				thumbnail: {
					url: "https://media.giphy.com/media/fvA1ieS8rEV8Y/giphy.gif",
				},
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: message.client.user?.tag,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
				fields: [
					{
						name: "API Latency",
						value: `${Math.round(this.client.ws.ping)}ms`,
						inline: true,
					},
				],
			})
		);
	}
}
```
This is our ping command, let's look at each aspect.

### The class
Classes in JS are very powerful, so we are using them here. Lets take a look at how our command is defined.

`export default class PingCommand extends Command`
This exports the `PingCommand` class as the default, basically if we were to do `import Ping from "./ping.ts"`, it would import this class. Extending the [`Command`](https://discord-akairo.github.io/#/docs/main/master/class/Command) class from [discord-akairo](https://www.npmjs.com/package/discord-akairo) gives us access to our client, and more.
Our constructor here defines aspects for our command, which are defined by the `super()`.

`super("ping", {` defines our command's ID, this will not be used by users, the aliases this command can be called by is defined in the `aliases` field.

TODO: Add more
