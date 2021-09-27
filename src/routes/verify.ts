import express from "express";
import axios, { AxiosResponse } from "axios";
import bcrypt from "bcrypt";
import Db from "../utils/db";

const db = new Db();

import { redis } from "../index";

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
}

async function checkCaptcha(response: any): Promise<any> {
	const req = await axios.post(
		"https://www.google.com/recaptcha/api/siteverify",
		new URLSearchParams({
			secret: recaptchaSecret,
			response,
		})
	);
	return req.data;
}

const router = express.Router();

router.get("/:state", async (req, res) => {
	let redisRes = await redis.getVerificationKey(req.params.state);
	if (!redisRes.userId)
		return res.status(400).send({
			message: "Bad Request",
		});

	res.status(200).send({
		redirectUri: new URL(
			`https://discord.com/oauth2/authorize?client_id=${clientID}&redirect_uri=${siteUrl}/verify&response_type=code&scope=identify%20guilds&state=${req.params.state}`
		).toString(),
	});
});

router.get("/:state/:code", async (req, res) => {
	let redisRes = await redis.getVerificationKey(req.params.state);
	if (!redisRes.userId)
		return res.status(400).send({
			message: "Bad Request",
		});

	let tokens: TokenResponse;

	try {
		tokens = await getTokens(req.params.code);
	} catch (error) {
		return res.status(500).send({
			message: "Internal Server Error",
		});
	}

	const requestedUser = await axios.get("https://discord.com/api/users/@me", {
		headers: {
			authorization: `${tokens.token_type} ${tokens.access_token}`,
		},
	});

	if (requestedUser.data.id !== redisRes.userId)
		res.status(403).send({
			message: "INVALID_USER",
		});
	else
		res.status(200).send({
			state: req.params.state,
			id: redisRes.userId,
			username: requestedUser.data.username,
			discriminator: requestedUser.data.discriminator,
			avatar: requestedUser.data.avatar
				? `https://cdn.discordapp.com/avatars/${requestedUser.data.id}/${requestedUser.data.avatar}`
				: `https://cdn.discordapp.com/embed/avatars/${requestedUser.data.discriminator}.png`,
		});
});

router.post("/:state", async (req, res) => {
	if (!req.body["g-recaptcha-response"] || !req.params.state || !req.body.id)
		return res.status(400);

	const results = await checkCaptcha(req.body["g-recaptcha-response"]);

	if (results.success) {
		let redisRes = await redis.getVerificationKey(req.params.state);

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
				fetchedMember?.verifiedAt >= current)
		) {
			res.status(200).send({
				message: "ALT_DETECTED",
			});

			redis.publish(
				`verification-${req.params.state}`,
				JSON.stringify({
					message: "alt",
					originalAccount: fetchedMember?.id,
				})
			);
		} else {
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(req.body.id, salt);

			db.addMember(req.body.id, hash, req.ip!);
			res.cookie("_verificationId", hash).status(200).send({
				message: "SUCCESS",
			});
			redis.publish(
				`verification-${req.params.state}`,
				JSON.stringify({
					message: "verified",
				})
			);
		}
		redis.removeVerification(req.params.state);
	}
});

export default router;
