import bunyan from "bunyan";

export default class Logger extends bunyan {
	constructor(options: bunyan.LoggerOptions) {
		options.level ??=
			process.env.NODE_ENV == "production" ? "info" : "debug";

		options.src ??= process.env.NODE_ENV == "production" ? false : true;

		options.stream ??= process.stdout;

		super(options);
	}
}
