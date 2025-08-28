export const debug_mode = (): boolean => {
    return process.env.DEBUG?.toLowerCase() === 'true';
};

export const authentication_enabled = (): boolean => {
    return process.env.ENABLE_AUTHENTICATION?.toLowerCase() === 'true';
};

export const logMessage = (text, type = 'info') => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    console.log(`[${timeString}] [${type.toUpperCase()}] ${text}`);
};
