import { auth } from '@/auth';

export const debug_mode = (): boolean => {
    return process.env.DEBUG?.toLowerCase() === 'true';
};

export const authentication_enabled = (): boolean => {
    return process.env.ENABLE_AUTHENTICATION?.toLowerCase() === 'true';
};

// A mapping of log level names to a numerical hierarchy.
// Higher numbers indicate more severe or important logs.
const LOG_LEVELS = {
    error: 4,
    warn: 3,
    info: 2,
    debug: 1,
    silent: 0,
};

// Default log level if not specified in the environment.
const DEFAULT_LOG_LEVEL = 'info';

// Determine the current logging level from the environment variable.
const currentLogLevel = process.env.LOG_LEVEL
    ? LOG_LEVELS[process.env.LOG_LEVEL.toLowerCase()]
    : LOG_LEVELS[DEFAULT_LOG_LEVEL];

/**
 * Logs a message to the console with a timestamp and a log level.
 * @param {string} text - The message to log.
 * @param {string} [level='info'] - The log level ('error', 'warn', 'info', 'debug').
 */
export const logMessage = (text, level = 'info') => {
    const messageLevel =
        LOG_LEVELS[level.toLowerCase()] || LOG_LEVELS[DEFAULT_LOG_LEVEL];

    // Only log the message if its level is greater than or equal to the
    // current configured log level.
    if (messageLevel >= currentLogLevel) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        console.log(`[${timeString}] [${level.toUpperCase()}] ${text}`);
    }
};

export async function validateAuthentication(): Promise<boolean> {
    const session = await auth();
    if (session == null) {
        return false;
    }
    return true;
}