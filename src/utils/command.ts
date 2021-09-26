import Command from "../struct/Command";
import Client from "../struct/Client";
import { User, Guild, GuildMember, Snowflake, Collection } from "discord.js";
import Embed from "../struct/Embed";
import schedule from "node-schedule";
import { Moment } from "moment";
const str_replace = require("locutus/php/strings/str_replace");

export function generateUsage(command: Command, prefix: string): string {
	let flags = "";

	let arglist = "";

	if (command.args)
		for (const arg of command.args) {
			if (!arg.prompt && !arg.flag && !arg.match)
				arglist = arglist + ` <${arg.id}>`;
			else if (arg.match == "flag") flags = flags + ` [${arg.flag}]`;
			else if (arg.match == "option")
				arglist = arglist + ` {${arg.id}:${arg.default || "?"}}`;
		}

	let usage = `${prefix}${command.aliases[0]}${flags}${arglist}`;

	return usage;
}

export function replace(input: string, user: User): string {
	return str_replace(
		["(username", "(tag", "(discriminator", "(id", "(mention"],
		[user.username, user.tag, user.discriminator, user.id, user.toString()],
		input
	);
}

export function setMute(
	client: Client,
	guild: Guild,
	member: GuildMember,
	admin: GuildMember,
	muteRole: Snowflake,
	expires: Moment,
	reason: string
) {
	const job = schedule.scheduleJob(expires.toDate(), async function () {
		if (member.roles.cache.has(muteRole)) member.roles.remove(muteRole);

		client.jobs.mutes.get(guild!.id)?.delete(member.id);

		client.sendToLogChannel(guild!, "member", {
			embeds: [
				new Embed(
					{
						title: "Member Unmuted",
						description: `${member.toString()}'s mute has expired.`,
						footer: {},
						thumbnail: {
							url: member.user.displayAvatarURL({
								dynamic: true,
							}),
						},
						fields: [
							{
								name: "Member",
								value: member.toString(),
								inline: true,
							},
							{
								name: "Muted By",
								value: admin.toString(),
								inline: true,
							},
							{
								name: "Length",
								value: `<t:${expires.unix()}:R> (<t:${expires.unix()}:f>)`,
							},
							{
								name: "Reason",
								value: reason ? `\`${reason}\`` : "None",
							},
						],
					},
					member.user,
					guild
				),
			],
		});
	});

	if (!client.jobs.mutes.has(guild.id))
		client.jobs.mutes.set(guild.id, new Collection());

	client.jobs.mutes.get(guild.id)?.set(member.id, job);
}
