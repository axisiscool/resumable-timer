import {
	TimerStatus,
	type TimerStartOptions,
	type TimerStartReturnValue,
	type TimerPauseAndResumeReturnValue,
	type TimerStopReturnValue
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
	public static async pause(id: string): Promise<TimerPauseAndResumeReturnValue> {
		if (!redis) {
			throw new Error('Please call setup function before starting a timer.');
		}

		const now = Date.now();
		const startTime = await redis.get(`timer:${id}`);

		if (!startTime) {
			throw new Error('Invalid timer ID provided.');
		}

		const remainingTime = now - Number(startTime);

		return { id, status: TimerStatus.PAUSED, remainingTime };
	}

	/**
	 * Resumes a currently running timer.
	 * @since 1.0.0
	 */
	public static async resume(id: string, remaining: number): Promise<TimerPauseAndResumeReturnValue> {
		if (!redis) {
			throw new Error('Please call setup function before starting a timer.');
		}

		const now = Date.now();
		const startTime = await redis.get(`timer:${id}`);

		const remainingTime = Math.abs(Number(startTime) - now + remaining);
		await redis.set(`timer:${id}`, now);

		return { id, status: TimerStatus.RUNNING, remainingTime };
	}

	/**
	 * Stops a currently running timer, and deletes it from Redis.
	 * @since 1.0.0
	 */
	public static async stop(id: string): Promise<TimerStopReturnValue> {
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
