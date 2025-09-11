// lib/components/client_components/AlertPopup.tsx
'use client';

import Image from 'next/image';
import React from 'react';
import { CloseIcon } from '../server_components/svg/icons';

// Define alert types for styling
export type AlertType = 'success' | 'warning' | 'error';

interface AlertPopupProps {
    message: string;
    type: AlertType;
    onDismiss: () => void; // Function to call when the alert should be dismissed
    isDismissing: boolean; // State to control slide-out animation (controlled by provider)
    style?: React.CSSProperties; // NEW: style prop for dynamic positioning (e.g., top)
    alertRef?: (instance: HTMLDivElement | null) => void; // UPDATED: Changed from RefObject to a callback ref
    header?: string; // NEW: Optional header prop for dynamic text
    isRefreshed?: boolean; // NEW: Indicates if the alert is a refreshed duplicate
    refreshCount?: number;
}

export const AlertPopup: React.FC<AlertPopupProps> = ({
    message,
    type,
    onDismiss,
    isDismissing,
    style,
    alertRef,
    header,
    // isRefreshed = false, // Default to false if not provided
    refreshCount = 0
}) => {
    // Determine alert styling based on type
    let alertBgClass = 'bg-yellow-100 border-yellow-400 text-yellow-700'; // Default for warning
    if (type === 'success') {
        alertBgClass = 'bg-green-100 border-green-400 text-green-700'; // Green for success
    } else if (type === 'error') {
        alertBgClass = 'bg-red-100 border-red-400 text-red-700'; // Red for error
    }

    // Use the provided header, or fallback to a default if not provided
    const alertHeader = header || 'Alert';

    // We use refreshCount to determine if this is a new or refreshed alert
    const isRefreshed = refreshCount > 0;

    return (
        <div
            ref={alertRef} // Attach the ref here so parent can measure
            role="alert"
            style={style} // Apply dynamic style (e.g., top) passed from AlertProvider
            className={`
        absolute right-0 w-fit min-w-[300px] max-w-sm p-4 rounded-lg shadow-lg flex items-center justify-between
        transition-all duration-300 ease-out transform pointer-events-auto {/* Ensure the alert itself is clickable */}
        ${alertBgClass}
        ${isDismissing ? 'animate-slide-out' : isRefreshed ? 'animate-jiggle' : 'animate-fade-in'}
      `}
        >
            <div>
                <strong className="font-bold">{`${alertHeader}: `}</strong>
                <span className="block sm:inline ml-2 text-wrap wrap-break-word">{message}</span>
            </div>
            <button
                onClick={onDismiss} // onDismiss now comes from the provider
                className="ml-4 text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-current rounded-full p-1 transition-opacity duration-200"
                aria-label="Dismiss alert"
            >
                <CloseIcon/>
                {/* <Image
                    src="/icons/close.svg"
                    alt="Close"
                    width={16}
                    height={16}
                    className="fill-current"
                /> */}
            </button>
        </div>
    );
};
