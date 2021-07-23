import express from "express";
import path from "path";
import Wiki from "../utils/wiki";

const { supportInvite } = require("../../config.json");

import { weblog, user } from "../index";

const wiki = new Wiki("../../app/wiki");

const router = express.Router();
router.get("/", async function (req, res) {
	try {
		return res.render("wiki", {
			avatar: user.avatarURL,
			username: user.username,
			support: supportInvite,
			page: null,
		});
	} catch (err) {
		weblog.error(err);
		return res.status(500).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 500,
			description: "Internal Server Error",
		});
	}
});

router.get("/:category", async function (req, res) {
	try {
		const category = wiki.findCategory(req.params.category);

		if (!category)
			return res.status(404).render("error", {
				username: user.username,
				avatar: user.avatarURL,
				code: 404,
				description: "Page Not Found",
			});

		return res.redirect(`${category.files[0].file.replace(".ejs", "")}`);
	} catch (err) {
		weblog.error(err);
		return res.status(500).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 500,
			description: "Internal Server Error",
		});
	}
});

router.get("/:category/:file", async function (req, res) {
	try {
		const category = wiki.findCategory(req.params.category);

		if (!category)
			return res.status(404).render("error", {
				username: user.username,
				avatar: user.avatarURL,
				code: 404,
				description: "Page Not Found",
			});

		const file = wiki.findPage(category, req.params.file);

		if (!file)
			return res.status(404).render("error", {
				username: user.username,
				avatar: user.avatarURL,
				code: 404,
				description: "Page Not Found",
			});

		return res.render("wiki", {
			avatar: user.avatarURL,
			username: user.username,
			support: supportInvite,
			page: path.resolve(wiki.dir, category.file, file.file),
		});
	} catch (err) {
		weblog.error(err);
		return res.status(500).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 500,
			description: "Internal Server Error",
		});
	}
});

export default router;
