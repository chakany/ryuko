import express from "express";
import { manager, log } from "../index";

const router = express.Router();

router.get("/", async function (req, res) {
	try {
		res.render("home", {
			totalShards: manager.totalShards,
			totalServers: await manager.fetchClientValues("guilds.cache.size"),
		});
	} catch (err) {
		log.error(err);
	}
});

export default router;
