import { redis } from './redis';

type StartIntervalFn = (timerId: string) => Promise<void>;

export async function startInterval(cb: StartIntervalFn, interval: number) {
	const timer = setInterval(async () => {
		const allTimers = await redis.scan('0', 'MATCH', 'timer:*');

		for (let i = 0; i < allTimers.length; ++i) {
			const [cursor] = allTimers[i];

			if (cursor === '0') {
				continue;
			}

			const [, id] = cursor.split(':');

			await cb(id);
		}
	}, interval);

	// Clean up timer cleanly before exiting
	process.on('beforeExit', () => clearInterval(timer));
}
