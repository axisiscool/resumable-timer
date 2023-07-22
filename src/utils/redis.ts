import type Redis from 'ioredis';

export let redis: Redis;

export function setup(client: Redis) {
	if (redis !== undefined) {
		throw new Error('Redis client already configured.');
	}

	redis = client;
}
