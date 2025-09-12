'use client';

import { Session } from 'next-auth';

export const getUsernameForConfiguration = (session: Session) => {
    return `${session.user?.name ?? 'default'}`;
};
