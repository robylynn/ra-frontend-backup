// lib/components/client_components/AlertContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { AlertType } from './AlertPopup'; // Import AlertType from AlertPopup

// Define the structure of an individual alert item in the queue
export interface AlertItem {
    id: string; // Unique ID for each alert
    message: string;
    type: AlertType;
    autoDismissDuration?: number; // Optional duration for this specific alert
    isDismissing: boolean; // For animation control
    header?: string; // NEW LINE: Optional header text for the alert
    // isRefreshed: boolean; // NEW: Signal that this is a refreshed alert
    refreshCount: number;
}

// Define the shape of the context value that will be provided
interface AlertContextType {
    // UPDATED LINE: Added header?: string to the showAlert function signature
    showAlert: (
        message: string,
        type: AlertType,
        header?: string,
        autoDismissDuration?: number
    ) => void;
    dismissAlert: (id: string) => void;
}

// Create the context with a default undefined value
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Custom hook to consume the AlertContext
export function useAlert() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}

// Export the context itself for use in the provider component
export default AlertContext;
