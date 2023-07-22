import type Redis from 'ioredis';
import {
	TimerStatus,
	type TimerStartOptions,
	type TimerStartReturnValue,
	type TimerPauseAndResumeReturnValue,
	type TimerStopReturnValue
} from '../types/TimerOptions';

export class Timer {
	private readonly redis: Redis;

	public constructor(redis: Redis) {
		if (!redis) {
			throw new Error('Redis client not provided.');
		}

		this.redis = redis;
	}

	/**
	 * Starts a new timer.
	 * @since 1.0.0
	 */
	public async start(options: TimerStartOptions): Promise<TimerStartReturnValue> {
		const { id, expiresAt } = options;

		const now = Date.now();
		await this.redis.set(`timer:${id}`, now);

		const timerExpiry = Number(expiresAt) - Number(new Date(now));

		return { id, status: TimerStatus.RUNNING, startTime: now, expiresAt: timerExpiry };
	}

	/**
	 * Pauses a currently running timer.
	 * @since 1.0.0
	 */
	public async pause(id: string): Promise<TimerPauseAndResumeReturnValue> {
		const now = Date.now();
		const startTime = await this.redis.get(`timer:${id}`);

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
	public async resume(id: string, remaining: number): Promise<TimerPauseAndResumeReturnValue> {
		const now = Date.now();
		const startTime = await this.redis.get(`timer:${id}`);

		const remainingTime = Math.abs(Number(startTime) - now + remaining);
		await this.redis.set(`timer:${id}`, now);

		return { id, status: TimerStatus.RUNNING, remainingTime };
	}

	/**
	 * Stops a currently running timer, and deletes it from Redis.
	 * @since 1.0.0
	 */
	public async stop(id: string): Promise<TimerStopReturnValue> {
		const startTime = await this.redis.get(`timer:${id}`);

		if (!startTime) {
			throw new Error('Invalid timer ID provided.');
		}

		await this.redis.del(`timer:${id}`);

		return { id, status: TimerStatus.STOPPED };
	}
}
