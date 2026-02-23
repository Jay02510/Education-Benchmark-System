
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
    log: (...args: any[]) => {
        if (isDev) console.log('[LOG]', ...args);
    },
    warn: (...args: any[]) => {
        if (isDev) console.warn('[WARN]', ...args);
    },
    error: (message: string, error?: any) => {
        // In production, we might send this to a service like Sentry
        if (isDev) {
            console.error('[ERROR]', message, error);
        } else {
            // Minimal production logging
            console.error(`[SYSTEM ERROR]: ${message}`);
        }
    },
    info: (...args: any[]) => {
        if (isDev) console.info('[INFO]', ...args);
    }
};
