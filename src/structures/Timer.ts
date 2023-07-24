import {
	TimerStatus,
	type TimerStartOptions,
	type TimerStartReturnValue,
	type TimerPauseAndStopReturnValue,
	type TimerResumeReturnValue
} from '../types/TimerOptions';
import { redis } from '../utils/redis';

export class Timer {
	/**
	 * Starts a new timer.
	 * @since 1.0.0
	 */
	public static async start(options: TimerStartOptions): Promise<TimerStartReturnValue> {
		if (!redis) {
			throw new Error('Please call setup function before starting a timer.');
		}

		const { id, expiresAt } = options;

		const now = Date.now();
		await redis.set(`timer:${id}`, now);

		const timerExpiry = Number(expiresAt) - Number(new Date(now));

		return { id, status: TimerStatus.RUNNING, startTime: now, expiresAt: timerExpiry };
	}

	/**
	 * Pauses a currently running timer.
	 * @since 1.0.0
	 */
	public static async pause(id: string): Promise<TimerPauseAndStopReturnValue> {
		if (!redis) {
			throw new Error('Please call setup function before starting a timer.');
		}

		const startTime = await redis.get(`timer:${id}`);

		if (!startTime) {
			throw new Error('Invalid timer ID provided.');
		}

		return { id, status: TimerStatus.PAUSED };
	}

	/**
	 * Resumes a currently running timer.
	 * @since 1.0.0
	 */
	public static async resume(id: string, expiresAt: number): Promise<TimerResumeReturnValue> {
		if (!redis) {
			throw new Error('Please call setup function before starting a timer.');
		}

		const now = Date.now();
		const startTime = await redis.get(`timer:${id}`);

		const remainingTime = now + expiresAt - Number(startTime);
		await redis.set(`timer:${id}`, now);

		return { id, status: TimerStatus.RUNNING, remainingTime };
	}

	/**
	 * Stops a currently running timer, and deletes it from Redis.
	 * @since 1.0.0
	 */
	public static async stop(id: string): Promise<TimerPauseAndStopReturnValue> {
		if (!redis) {
			throw new Error('Please call setup function before starting a timer.');
		}

		const startTime = await redis.get(`timer:${id}`);

		if (!startTime) {
			throw new Error('Invalid timer ID provided.');
		}

		await redis.del(`timer:${id}`);

		return { id, status: TimerStatus.STOPPED };
	}
}
