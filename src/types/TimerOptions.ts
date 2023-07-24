export interface TimerStartOptions {
	/**
	 * The ID of the timer
	 */
	id: string;

	/**
	 * The time you want the timer to expire
	 */
	expiresAt: Date;
}

export interface TimerPauseOptions {
	/**
	 * The ID of the timer
	 */
	id: string;
}

export enum TimerStatus {
	RUNNING = 'running',
	PAUSED = 'paused',
	STOPPED = 'stopped'
}

export type TimerStartReturnValue = {
	id: string;
	status: TimerStatus;
	startTime: number;
	expiresAt: number;
};

export type TimerResumeReturnValue = {
	id: string;
	status: TimerStatus;
	remainingTime: number;
};

export type TimerPauseAndStopReturnValue = {
	id: string;
	status: TimerStatus;
};
