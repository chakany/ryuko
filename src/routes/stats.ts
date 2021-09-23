import express from "express";
import { manager } from "../index";

const router = express.Router();
router.get("/", async function (req, res) {
	res.status(200).send({
		servers: (await manager.fetchClientValues("guilds.cache.size")).reduce(
			(acc: any, guildCount) => acc + guildCount,
			0
		),
		users: (await manager.fetchClientValues("users.cache.size")).reduce(
			(acc: any, memberCount) => acc + memberCount,
			0
		),
		channels: (
			await manager.fetchClientValues("channels.cache.size")
		).reduce((acc: any, channelCount) => acc + channelCount, 0),
		shards: manager.totalShards,
	});
});

export default router;
