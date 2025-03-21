// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function NextAuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    return <SessionProvider>{children}</SessionProvider>;
}
