// lib/components/client_components/AlertProvider.tsx
'use client';

import AlertContext, {
    AlertItem,
} from '@/lib/components/client_components/AlertContext'; // Using absolute import
import {
    AlertPopup,
    AlertType,
} from '@/lib/components/client_components/AlertPopup'; // Using absolute import
import React, {
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface AlertProviderProps {
    children: ReactNode;
    defaultAutoDismissDuration?: number; // Global default duration
    slideOutDuration?: number; // Match CSS animation duration
    stackSpacing?: number; // Space in pixels between stacked alerts
}

export const AlertProvider: React.FC<AlertProviderProps> = ({
    children,
    defaultAutoDismissDuration = 5000, // Default to 5 seconds
    slideOutDuration = 300, // Default to 300ms
    stackSpacing = 16, // Default spacing in pixels (e.g., Tailwind's space-y-4 is 16px)
}) => {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    // State to store calculated top positions for each alert
    const [alertPositions, setAlertPositions] = useState<{
        [id: string]: number;
    }>({});
    // Ref to hold references to the DOM elements of the alerts
    const alertRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
    // Ref to store the latest measured heights of alerts, to help with transitions
    const alertHeights = useRef<{ [id: string]: number }>({});

    // Function to add a new alert to the queue
    // UPDATED LINE: Added headerOverride?: string to the showAlert callback signature
    const showAlert = useCallback(
        (
            message: string,
            type: AlertType,
            autoDismissDurationOverride?: number,
            headerOverride?: string
        ) => {
            // // Check if a duplicate alert already exists and is not dismissing.
            // const existingAlert = alerts.find(
            //     (alert) =>
            //         alert.message === message &&
            //         alert.type === type &&
            //         !alert.isDismissing
            // );

            // if (existingAlert) {
            //     // If a duplicate is found, update the existing alert to bring it to the front
            //     // and reset its auto-dismiss timer.
            //     setAlerts((prevAlerts) => {
            //         const newAlerts = prevAlerts.filter(
            //             (alert) => alert.id !== existingAlert.id
            //         );
            //         // Create a new alert object to ensure a state update is triggered
            //         const updatedAlert = {
            //             ...existingAlert,
            //             id: uuidv4(), // Give it a new ID to force a re-render
            //             autoDismissDuration:
            //                 autoDismissDurationOverride ??
            //                 defaultAutoDismissDuration,
            //             header: headerOverride || existingAlert.header,
            //         };
            //         return [updatedAlert, ...newAlerts];
            //     });
            //     console.log('Duplicate alert timer reset:', message, type);
            //     return;
            // }




            // // Check if an identical alert (same message and type) is already active and not dismissing.
            // const isDuplicate = alerts.find(
            //     (alert) =>
            //         alert.message === message &&
            //         alert.type === type &&
            //         !alert.isDismissing
            // );

            // // If a duplicate is found, simply exit the function.
            // if (isDuplicate) {
            //     console.log('Duplicate alert blocked:', message, type);
            //     return;
            // }

            // const id = uuidv4();
            // const newAlert: AlertItem = {
            //     id,
            //     message,
            //     type,
            //     autoDismissDuration:
            //         autoDismissDurationOverride ?? defaultAutoDismissDuration,
            //     isDismissing: false,
            //     header: headerOverride, // NEW LINE: Pass the headerOverride to the AlertItem
            // };
            // // Add new alerts to the beginning of the array to make them appear at the top
            // setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);




            setAlerts((prevAlerts) => {
                // // Check if an identical alert (same message and type) is already active and not dismissing.
                // const existingAlert = prevAlerts.find(
                //     (alert) =>
                //         alert.message === message &&
                //         alert.type === type &&
                //         !alert.isDismissing
                // );

                // if (existingAlert) {
                //     // If a duplicate is found, create a new object with a new ID
                //     // and reset its auto-dismiss timer. This forces a re-render.
                //     console.log(
                //         'Duplicate alert found, resetting timer:',
                //         message,
                //         type
                //     );
                //     const updatedAlert: AlertItem = {
                //         ...existingAlert,
                //         id: uuidv4(), // Assign a new ID to force a re-render
                //         autoDismissDuration:
                //             autoDismissDurationOverride ??
                //             defaultAutoDismissDuration,
                //         header: headerOverride || existingAlert.header, // Keep old header if new one not provided
                //         isRefreshed: true, // NEW: Signal that this is a refreshed alert
                //     };

                //     // Filter out the old alert and prepend the updated one to the array.
                //     const newAlerts = prevAlerts.filter(
                //         (alert) => alert.id !== existingAlert.id
                //     );
                //     return [updatedAlert, ...newAlerts];
                // }

                const existingIndex = prevAlerts.findIndex(
                    (alert) =>
                        alert.message === message &&
                        alert.type === type &&
                        !alert.isDismissing
                );

                // IMPORTANT CHANGE: Do not change the alert's ID.
                if (existingIndex > -1) {
                    console.log(
                        'Duplicate alert found, resetting timer:',
                        message,
                        type
                    );
                    const updatedAlerts = [...prevAlerts];
                    updatedAlerts[existingIndex] = {
                        ...updatedAlerts[existingIndex],
                        autoDismissDuration:
                            autoDismissDurationOverride ??
                            defaultAutoDismissDuration,
                        header:
                            headerOverride ||
                            updatedAlerts[existingIndex].header,
                        // isRefreshed: true, // Signal that this is a refreshed alert
                        refreshCount:
                            updatedAlerts[existingIndex].refreshCount + 1, // Increment the refresh count
                    };
                    // This update avoids a full re-mount, preventing the fade-in animation.
                    return updatedAlerts;
                }

                const id = uuidv4();
                const newAlert: AlertItem = {
                    id,
                    message,
                    type,
                    autoDismissDuration:
                        autoDismissDurationOverride ??
                        defaultAutoDismissDuration,
                    isDismissing: false,
                    header: headerOverride,
                    // isRefreshed: false, // NEW: Signal that this is a refreshed alert
                    refreshCount: 0
                };
                // Add new alerts to the beginning of the array.
                return [newAlert, ...prevAlerts];
            });
        },
        // [defaultAutoDismissDuration, alerts]
        [defaultAutoDismissDuration]
    );

    // Function to dismiss a specific alert (manual or after animation)
    const dismissAlert = useCallback((id: string) => {
        setAlerts((prevAlerts) =>
            prevAlerts.filter((alert) => alert.id !== id)
        );
        // Clean up its stored height when dismissed
        delete alertHeights.current[id];
    }, []);

    // Effect to measure alert heights and dynamically calculate their positions
    useEffect(() => {
        const calculatePositions = () => {
            let currentTop = 0;
            const newPositions: { [id: string]: number } = {};
            const updatedHeights: { [id: string]: number } = {};

            // Iterate over alerts from newest to oldest (index 0 to end)
            // to calculate their top positions for a stack descending from the screen top.
            alerts.forEach((alert) => {
                const alertElement = alertRefs.current[alert.id];
                // Use previous height if element not yet rendered or has no offsetHeight
                let alertHeight = alertHeights.current[alert.id] || 0;

                if (alertElement && alertElement.offsetHeight > 0) {
                    alertHeight = alertElement.offsetHeight;
                }
                updatedHeights[alert.id] = alertHeight; // Store or update measured height

                newPositions[alert.id] = currentTop;

                // Only contribute to the next alert's position if it's not currently dismissing
                if (!alert.isDismissing) {
                    currentTop += alertHeight + stackSpacing;
                }
            });

            alertHeights.current = updatedHeights; // Update ref with latest measured heights
            setAlertPositions(newPositions);
        };

        // Attach ResizeObserver to each alert to detect height changes
        const observer = new ResizeObserver((entries) => {
            let needsRecalculation = false;
            entries.forEach((entry) => {
                const id = (entry.target as HTMLElement).dataset.alertId;
                // Recalculate if height has actually changed
                if (
                    id &&
                    alertHeights.current[id] !== entry.contentRect.height
                ) {
                    needsRecalculation = true;
                    alertHeights.current[id] = entry.contentRect.height; // Update height in ref immediately
                }
            });
            if (needsRecalculation) {
                calculatePositions();
            }
        });

        // Observe all currently active alerts
        alerts.forEach((alert) => {
            const element = alertRefs.current[alert.id];
            if (element) {
                element.dataset.alertId = alert.id; // Tag element with ID for observer
                observer.observe(element);
            }
        });

        // Initial calculation when alerts change
        calculatePositions();

        // Cleanup ResizeObserver
        return () => observer.disconnect();
    }, [alerts, stackSpacing, slideOutDuration]);

    // Effect to manage auto-dismissal for all alerts
    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        const dismissalTimers: NodeJS.Timeout[] = [];

        alerts.forEach((alert) => {
            if (alert.autoDismissDuration && !alert.isDismissing) {
                const timerId = setTimeout(() => {
                    setAlerts((prevAlerts) =>
                        prevAlerts.map((a) =>
                            a.id === alert.id ? { ...a, isDismissing: true } : a
                        )
                    );
                    const dismissTimerId = setTimeout(() => {
                        dismissAlert(alert.id);
                    }, slideOutDuration);
                    dismissalTimers.push(dismissTimerId);
                }, alert.autoDismissDuration);
                timers.push(timerId);
            }
        });

        return () => {
            timers.forEach(clearTimeout);
            dismissalTimers.forEach(clearTimeout);
        };
    }, [alerts, dismissAlert, slideOutDuration]);

    const contextValue = {
        showAlert,
        dismissAlert,
    };

    return (
        <AlertContext.Provider value={contextValue}>
            {children}
            {/* Container for stacked alerts */}
            {/* Use pointer-events-none on container to allow interaction with elements behind alerts */}
            <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
                {alerts.map((alert) => (
                    <AlertPopup
                        // key={alert.id}
                        // The key is set here! It combines the unique ID and the refresh count.
                        key={`${alert.id}-${alert.refreshCount}`}
                        alertRef={(el) => (alertRefs.current[alert.id] = el)} // Assign ref to element
                        message={alert.message}
                        type={alert.type}
                        onDismiss={() => {
                            setAlerts((prevAlerts) =>
                                prevAlerts.map((a) =>
                                    a.id === alert.id
                                        ? { ...a, isDismissing: true }
                                        : a
                                )
                            );
                            setTimeout(
                                () => dismissAlert(alert.id),
                                slideOutDuration
                            );
                        }}
                        isDismissing={alert.isDismissing}
                        style={{ top: alertPositions[alert.id] || 0 }} // Apply dynamically calculated top
                        header={alert.header} // NEW LINE: Pass the header to the AlertPopup
                        refreshCount={alert.refreshCount}
                    />
                ))}
            </div>
        </AlertContext.Provider>
    );
};
