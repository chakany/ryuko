import express from "express";
import axios from "axios";
import bcrypt from "bcrypt";
import { User } from "discord.js";

import Db from "../utils/db";

const db = new Db();

import { manager, weblog, redis, user } from "../index";

const {
	clientID,
	clientSecret,
	siteUrl,
	recaptchaSecret,
	recaptchaSiteKey,
} = require("../../config.json");

interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

async function getTokens(code: any): Promise<TokenResponse> {
	try {
		const req = await axios.post(
			"https://discord.com/api/oauth2/token",
			new URLSearchParams({
				client_id: clientID,
				client_secret: clientSecret,
				code,
				grant_type: "authorization_code",
				redirect_uri: `${siteUrl}/verify`,
				scope: "identify",
			})
		);
		return req.data;
	} catch (error) {
		throw new Error(error);
	}
}

async function checkCaptcha(response: any): Promise<any> {
	try {
		const req = await axios.post(
			"https://www.google.com/recaptcha/api/siteverify",
			new URLSearchParams({
				secret: recaptchaSecret,
				response,
			})
		);
		return req.data;
	} catch (error) {
		throw new Error(error);
	}
}

const router = express.Router();

// Our main route
router.get("/", async (req, res) => {
	if (!req.query.state)
		return res.status(400).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 400,
			description: "Bad Request",
		});
	let redisRes = await redis.getVerificationKey(req.query.state);
	if (!redisRes.userId)
		return res.status(400).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 400,
			description: "Bad Request",
		});
	if (!req.query.code) {
		res.redirect(
			new URL(
				`https://discord.com/oauth2/authorize?client_id=${clientID}&redirect_uri=${siteUrl}/verify&response_type=code&scope=identify%20guilds&state=${req.query.state}`
			).toString()
		);
	} else if (req.query.code) {
		let tokens: TokenResponse;
		try {
			tokens = await getTokens(req.query.code);

			const user = await axios.get("https://discord.com/api/users/@me", {
				headers: {
					authorization: `${tokens.token_type} ${tokens.access_token}`,
				},
			});

			const bot: User = await (
				await manager.fetchClientValues("user")
			)[0];

			if (user.data.id !== redisRes.userId)
				res.render("verify", {
					verified: false,
					error: "You signed in with a different account than the one you initiated the verification with. Please make sure you login with the same account.",
					username: bot.username,
					avatar: bot.avatarURL,
				});
			else
				res.render("verify", {
					user: user.data,
					verified: false,
					error: null,
					siteKey: recaptchaSiteKey,
					state: req.query.state,
					id: redisRes.userId,
					username: bot.username,
					avatar: bot.avatarURL,
				});
		} catch (error) {
			weblog.error(error);
			res.status(500).render("error", {
				username: user.username,
				avatar: user.avatarURL,
				code: 500,
				description: "Internal Server Error",
			});
		}
	} else
		return res.status(400).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 400,
			description: "Bad Request",
		});
});

router.post("/", async (req, res) => {
	if (!req.body["g-recaptcha-response"] || !req.body.state || !req.body.id)
		return res.status(400).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 400,
			description: "Bad Request",
		});

	try {
		const results = await checkCaptcha(req.body["g-recaptcha-response"]);

		if (results.success) {
			let redisRes = await redis.getVerificationKey(req.body.state);

			const fetchedMember = await db.getMembersByIdentifier(
				req.cookies._verificationId,
				req.ip
			);
			const current = new Date();
			current.setDate(current.getDate() - 14);
			if (
				(fetchedMember?.ipAddress &&
					fetchedMember.cookieId &&
					!(await bcrypt.compare(
						req.body.id,
						fetchedMember?.cookieId
					))) ||
				(fetchedMember?.ipAddress == req.ip &&
					fetchedMember?.id !== req.body.id &&
					fetchedMember?.verifiedAt > current)
			) {
				res.render("verify", {
					verified: true,
					error: null,
					username: user.username,
					avatar: user.avatarURL,
				});
				redis.publish(
					`verification-${req.body.state}`,
					JSON.stringify({
						message: "alt",
						originalAccount: fetchedMember?.id,
					})
				);
			} else {
				const salt = await bcrypt.genSalt(10);
				const hash = await bcrypt.hash(req.body.id, salt);

				db.addMember(req.body.id, hash, req.ip!);
				res.cookie("_verificationId", hash).render("verify", {
					verified: true,
					error: null,
					username: user.username,
					avatar: user.avatarURL,
				});
				redis.publish(
					`verification-${req.body.state}`,
					JSON.stringify({
						message: "verified",
					})
				);
			}
			redis.removeVerification(req.body.state);
		}
	} catch (error) {
		weblog.error(error);
		return res.status(500).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 500,
			description: "Internal Server Error",
		});
	}
});

export default router;
