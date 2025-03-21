// Frontend Web Application for RA Products
// Developed by R2 Labs

import { getServerSession } from 'next-auth/next';
import { ReactNode } from 'react';

import authOptions from '@/lib/auth/auth_options';

import UnauthenticatedIndicator from './unauthenticated_indicator';

export default async function ProtectedPage(props: { children: ReactNode }) {
    const session = await getServerSession(authOptions);
    if (session == null) {
        return <UnauthenticatedIndicator />;
    }

    return <>{props.children}</>;
}
