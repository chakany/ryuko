export interface Queue {
	player: any | null;
	tracks: any[];
	paused: boolean;
	loop: boolean;
}

export interface LavasfyConfig {
	id: string;
	host: string;
	port: string;
	password: string;
}
