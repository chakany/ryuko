import express, {
	Request,
	Response,
	NextFunction,
	json,
	urlencoded,
} from "express";
import { Server as HttpServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import Logger from "./struct/Logger";
import Commands from "./routes/commands";
import Stats from "./routes/stats";
import Verify from "./routes/verify";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { port } = require("../config.json");

const production = process.env.NODE_ENV === "production";
export const log = new Logger({ name: "web" });

const app = express();
const server = new HttpServer(app);

app.disable("x-powered-by");
// @ts-expect-error 2769
app.use(urlencoded({ extended: true }));
// @ts-expect-error 2769
app.use(json());
app.use(cookieParser());
app.use(cors());

app.use("/stats", Stats);
app.use("/commands", Commands);
app.use("/verify", Verify);

if (production) app.set("trust proxy", true);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
	// Log to console
	log.error(error);

	// Return error page
	res.sendStatus(500);

	next(error);
});

export function start(): void {
	try {
		server.listen(port, () => {
			log.info(`Listening on port ${port}`);
		});
	} catch (error) {
		log.error(error);
	}
}
