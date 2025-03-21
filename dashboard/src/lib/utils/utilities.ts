export const debug_mode = (): boolean => {
    return process.env.DEBUG.toLowerCase() === 'true';
};

export const authentication_enabled = (): boolean => {
    return process.env.ENABLE_AUTHENTICATION.toLowerCase() === 'true';
};
