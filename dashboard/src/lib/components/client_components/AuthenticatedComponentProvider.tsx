// lib/components/client_components/AuthenticatedAppProviders.tsx
'use client'; // This is a Client Component

import { useSession } from 'next-auth/react'; // For checking authentication status
import { ReactNode } from 'react';

// Import your authenticated-only providers/components
import { SimpleDataUpdater } from '@/lib/components/client_components/DataUpdater';
import { IOPointContextProvider } from '@/lib/components/client_components/IOPointContext';
import { WebSocketProvider } from '@/lib/components/client_components/WebsocketSubscriptionProvider';
import LoadingIndicator from '@/lib/components/server_components/LoadingIndicator';

interface AuthenticatedComponentProviderProps {
    children: ReactNode;
}

export default function AuthenticatedComponentProvider({
    children,
}: AuthenticatedComponentProviderProps) {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const isSessionLoading = status === 'loading';

    if (isSessionLoading) {
        // Optionally render a loading spinner or placeholder while session is being checked
        return (
            <div className="flex flex-row items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <LoadingIndicator
                    text={'Waiting for session...'.toUpperCase()}
                />
                {/* <p className="text-lg text-gray-700 dark:text-gray-300 animate-pulse">
                    Loading application...
                </p> */}
            </div>
        );
    }

    if (!isAuthenticated) {
        // If not authenticated, just render children (this will be your sign-in/register pages)
        // We don't want to load authenticated providers on unauthenticated routes.
        return (
            <IOPointContextProvider>
                {' '}
                {/* IOPointContext might be needed even unauthenticated, depending on its dependencies */}
                {children}
            </IOPointContextProvider>
        );
    }

    // If authenticated, render all providers and components that require authentication
    return (
        <WebSocketProvider>
            <SimpleDataUpdater />{' '}
            {/* This likely depends on WebSocketProvider */}
            <IOPointContextProvider>
                {children} {/* Your page content */}
            </IOPointContextProvider>
        </WebSocketProvider>
    );
}
