// Frontend Web Application for RA Products
// Developed by R2 Labs

import { auth } from '@/auth';
import { ReactNode } from 'react';

import UnauthenticatedIndicator from './UnauthenticatedIndicator';

export default async function ProtectedPage(props: { children: ReactNode }) {
    const session = await auth();
    if (session == null) {
        return <UnauthenticatedIndicator />;
    }

    return <>{props.children}</>;
}
