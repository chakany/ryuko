import express from "express";
import path from "path";
import Wiki from "../struct/Wiki";

const { prefix } = require("../../config.json");

import { user } from "../index";

const wiki = new Wiki("../../app/wiki");

const router = express.Router();
router.get("/", async function (req, res) {
	res.redirect("/wiki/Home");
});

router.get("/:category", async function (req, res) {
	const category = wiki.findCategory(req.params.category);
	const page = wiki.findPage(wiki.categories[0], req.params.category);

	if (!category && !page)
		return res.status(404).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 404,
			description: "Page Not Found",
		});
	else if (!category && page) {
		return res.render("wiki", {
			avatar: user.avatarURL,
			username: user.username,
			page: path.resolve(wiki.dir, page.file),
			categories: wiki.categories,
			prefix,
		});
	}

	return res.redirect(`${category!.files[0].file.replace(".ejs", "")}`);
});

router.get("/:category/:file", async function (req, res) {
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
		prefix,
		page: path.resolve(wiki.dir, category.file, file.file),
		categories: wiki.categories,
	});
});

export default router;
