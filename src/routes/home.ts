import express from "express";

const { supportInvite } = require("../../config.json");

import { manager, user } from "../index";

function formatNumbers(x: number) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const router = express.Router();
router.get("/", async function (req, res) {
	res.render("index", {
		totalServers: (
			await manager.fetchClientValues("guilds.cache.size")
		).reduce((acc: any, guildCount) => acc + guildCount, 0),
		totalUsers: (
			await manager.fetchClientValues("users.cache.size")
		).reduce((acc: any, memberCount) => acc + memberCount, 0),
		totalChannels: (
			await manager.fetchClientValues("channels.cache.size")
		).reduce((acc: any, channelCount) => acc + channelCount, 0),
		totalShards: manager.totalShards,
		avatar: user.avatarURL,
		username: user.username,
		support: supportInvite,
		invite: `https://discord.com/oauth2/authorize?client_id=${user.id}&permissions=8&scope=bot`,
		formatNumbers,
	});
});

export default router;
