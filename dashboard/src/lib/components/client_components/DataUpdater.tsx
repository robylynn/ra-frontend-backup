// // Frontend Web Application for RA Products
// // Developed by R2 Labs

// 'use client';

// import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
// import { useContext, useEffect, useState } from 'react';

// import { uiConfigSchema, UiConfig, UiConfigApiResponse, uiConfigApiResponseSchema } from '@/lib/models/ui_configuration';
// import { fetchFromBackendApi } from '@/lib/utils/timeoutFetch';

// export const SimpleDataUpdater = () => {
//     const { dashboardContext, setDashboardContext } =
//         useContext(DashboardContext);

//     useEffect(() => {
//         // Define an async function to handle the API call
//         const fetchConfig = async () => {
//             try {
//                 const validatedData = await fetchFromBackendApi<UiConfigApiResponse>(
//                     '/api/backend/ui/config/abc',
//                     uiConfigApiResponseSchema
//                 );

//                 // setValidatedConfig(validatedData as UiConfig);
                
//                 setDashboardContext({
//                     payload: { configuration: validatedData.config_data as UiConfig },
//                     type: 'ui_config/set',
//                 });

//                 console.log(
//                     `Got UI configuration: ${JSON.stringify(validatedData.config_data)}`
//                 );
//             } catch (err) {
//                 console.error(`Error loading UI configuration: ${err}`);
//             }
//         };

//         // Call the async function
//         fetchConfig();
//     }, []); // The empty dependency array [] ensures this effect runs only once on mount

//     return <></>
// }


// // Frontend Web Application for RA Products
// // Developed by R2 Labs

// 'use client';

// import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
// import { useContext, useEffect, useState } from 'react';

// import { uiConfigSchema, UiConfig, UiConfigApiResponse, uiConfigApiResponseSchema, DEFAULT_UI_CONFIG } from '@/lib/models/ui_configuration';
// import { fetchFromBackendApi } from '@/lib/utils/timeoutFetch';
// import Image from 'next/image'; // NEW: Import Image component

// // Define alert types for styling
// type AlertType = 'success' | 'warning' | 'error';

// export const SimpleDataUpdater = () => {
//     const { setDashboardContext } = useContext(DashboardContext);
//     const [alertState, setAlertState] = useState<{ message: string; type: AlertType } | null>(null);
//     const [isAlertDismissing, setIsAlertDismissing] = useState(false);

//     useEffect(() => {
//         // Define an async function to handle the API call and configuration logic
//         const fetchConfig = async () => {
//             let configToSet: UiConfig = DEFAULT_UI_CONFIG; // Start with default config
//             let message: string | null = null; // Message for potential alerts
//             let type: AlertType = 'warning'; // Default alert type

//             try {
//                 const apiResponse: UiConfigApiResponse = await fetchFromBackendApi<UiConfigApiResponse>(
//                     '/api/backend/ui/config/abc',
//                     uiConfigApiResponseSchema // Pass the schema for the *entire API response*
//                 );
                
//                 // If we reach here, apiResponse is a valid UiConfigApiResponse object.
//                 // Now, check if the actual config_data is present and valid within this response.
//                 if (apiResponse && apiResponse.config_data) {
//                     configToSet = apiResponse.config_data;
//                     // NEW: Set a success message if config was retrieved and valid
//                     message = `UI configuration successfully loaded. Client ID: ${apiResponse.client_id}, Last Updated: ${new Date(apiResponse.last_updated).toLocaleString()}.`;
//                     type = 'success'; // Set alert type to success
//                     console.log(`Got UI configuration: ${JSON.stringify(configToSet)}`);
//                 } 
//                 // Scenario 2: API call successful, but no config_data returned (e.g., config not found in DB)
//                 // This means apiResponse was valid, but its config_data field was empty or null.
//                 else if (apiResponse && !apiResponse.config_data) {
//                     message = "No UI configuration detected in the backend. Default configuration has been loaded.";
//                     type = 'warning'; // Set alert type to warning
//                     console.warn(message);
//                     // configToSet is already DEFAULT_UI_CONFIG
//                 }
//                 // Note: The `fetchFromBackendApi` function should throw an error if `apiResponse.success` is false
//                 // (if `ApiResponse` is the outer wrapper) or if the main data structure doesn't validate.
//                 // If `uiConfigApiResponseSchema` itself has a `success` field, it would be checked here.
//                 // Assuming `fetchFromBackendApi`'s `createApiResponseSchema` wraps `T` inside a `backend_response`
//                 // and throws on `backend_response.success == false`, this check isn't strictly for `apiResponse.success`.
//                 // The main check for this is in the `catch` block.

//             } catch (err: any) {
//                 // This catch block will handle all failure scenarios thrown by fetchFromBackendApi:
//                 // - Network errors
//                 // - HTTP errors (!response.ok)
//                 // - API returned a failure (e.g., `backend_response.success: false` if `fetchFromBackendApi` internally checks this)
//                 // - Zod validation errors (if the full `UiConfigApiResponse` doesn't match `uiConfigApiResponseSchema`)
//                 // - Timeout errors

//                 if (err.message && err.message.includes('API returned a failure:')) {
//                     // This catches specific errors thrown by fetchFromBackendApi,
//                     // which might include messages from the backend or internal processing indicating config absence/failure.
//                     message = `No UI configuration detected in the backend. Default configuration has been loaded. Error: ${err.message}`;
//                     type = 'warning'; // Still a warning if no config, even if API reported failure
//                     console.warn(message);
//                 } else {
//                     message = `Failed to fetch UI configuration from the backend. Default configuration has been loaded. Error: ${err.message || String(err)}.`;
//                     type = 'error'; // Set alert type to error for general failures
//                     console.error(`Error loading UI configuration: ${err}`);
//                 }
//                 // configToSet remains DEFAULT_UI_CONFIG in all catch scenarios.
//             } finally {
//                 // Always set a configuration (either fetched or default) and update alert message
//                 setDashboardContext({
//                     payload: { configuration: configToSet },
//                     type: 'ui_config/set',
//                 });
//                 if (message) {
//                     setAlertState({ message, type }); // Display alert if a message was generated
//                 }
//             }
//         };

//         // Call the async function when the component mounts
//         fetchConfig();
//     }, [setDashboardContext]); // Dependency array to re-run if setDashboardContext changes (unlikely)

//     // Effect for auto-dismissing alerts
//     useEffect(() => {
//         if (alertState) {
//             // Auto-dismiss successful or warning alerts after 5 seconds
//             const autoDismissDuration = 6000;
//             const slideOutDuration = 300; // Match CSS animation duration

//             const timer = setTimeout(() => {
//                 setIsAlertDismissing(true); // Trigger slide-out animation
//                 setTimeout(() => {
//                     setAlertState(null); // Actually remove after animation
//                     setIsAlertDismissing(false);
//                 }, slideOutDuration);
//             }, autoDismissDuration);

//             // Cleanup function to clear the timeout if component unmounts
//             // or if alertState changes before the timer finishes
//             return () => {
//                 clearTimeout(timer);
//                 setIsAlertDismissing(false); // Reset dismissal state
//             };
//         }
//     }, [alertState]); // Re-run this effect whenever alertState changes

//     // Determine alert styling based on type
//     let alertBgClass = 'bg-yellow-100 border-yellow-400 text-yellow-700'; // Default for warning
//     if (alertState?.type === 'success') {
//         alertBgClass = 'bg-green-100 border-green-400 text-green-700'; // Green for success
//     } else if (alertState?.type === 'error') {
//         alertBgClass = 'bg-red-100 border-red-400 text-red-700'; // Red for error
//     }

//     return (
//         <>
//             {/* Conditional alert message display */}
//             {alertState && (
//                 <div
//                     role="alert"
//                     className={`
//                         fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg shadow-lg flex items-center justify-between transition-transform duration-300 ease-out
//                         ${alertBgClass} 
//                         ${isAlertDismissing ? 'animate-slide-out' : 'animate-fade-in'}
//                     `}
//                 >
//                     <div>
//                         <strong className="font-bold">
//                             Configuration Alert:
//                         </strong>
//                         <span className="block sm:inline ml-2">
//                             {alertState.message}
//                         </span>
//                     </div>
//                     <button
//                         onClick={() => {
//                             setIsAlertDismissing(true);
//                             setTimeout(() => {
//                                 setAlertState(null);
//                                 setIsAlertDismissing(false);
//                             }, 300); // Match slide-out duration
//                         }}
//                         className="ml-4 text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-current rounded-full p-1 transition-opacity duration-200"
//                         aria-label="Dismiss alert"
//                     >
//                         {/* <svg className="h-4 w-4 fill-current" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.103l-2.651 3.746a1.2 1.2 0 0 1-1.697-1.697l3.746-2.651-3.746-2.651a1.2 1.2 0 1 1 1.697-1.697L10 8.897l2.651-3.746a1.2 1.2 0 1 1 1.697 1.697L11.103 10l3.746 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg> */}
//                         <Image
//                             src="/icons/close.svg"
//                             alt="Close"
//                             width={16}
//                             height={16}
//                             className="fill-current"
//                         />
//                     </button>
//                 </div>
//             )}
//         </>
//     );
// };

// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { useContext, useEffect, useState } from 'react'; // useState is still used for internal component state, not alerts

import {
    UiConfig,
    UiConfigApiResponse,
    uiConfigApiResponseSchema,
    DEFAULT_UI_CONFIG,
} from '@/lib/models/ui_configuration';
import { fetchFromBackendApi } from '@/lib/utils/timeoutFetch';
import { useAlert } from '@/lib/components/client_components/AlertContext'; // NEW: Import useAlert hook
import { AlertType } from '@/lib/components/client_components/AlertPopup';

export const SimpleDataUpdater = () => {
    const { setDashboardContext } = useContext(DashboardContext);
    const { showAlert } = useAlert(); // NEW: Use the showAlert function from context

    useEffect(() => {
        // Define an async function to handle the API call and configuration logic
        const fetchConfig = async () => {
            let configToSet: UiConfig = DEFAULT_UI_CONFIG; // Start with default config
            let message: string | null = null; // Message for potential alerts
            let type: AlertType = 'warning'; // Default alert type

            try {
                const apiResponse: UiConfigApiResponse = await fetchFromBackendApi<UiConfigApiResponse>(
                    '/api/backend/ui/config/abc',
                    uiConfigApiResponseSchema // Pass the schema for the *entire API response*
                );
                
                // If we reach here, apiResponse is a valid UiConfigApiResponse object.
                // Now, check if the actual config_data is present and valid within this response.
                if (apiResponse && apiResponse.config_data) {
                    configToSet = apiResponse.config_data;
                    message = `UI configuration successfully loaded. Client ID: ${apiResponse.client_id}, Last Updated: ${new Date(apiResponse.last_updated).toLocaleString()}.`;
                    type = 'success'; // Set alert type to success
                    console.log(`Got UI configuration: ${JSON.stringify(configToSet)}`);
                } 
                // Scenario 2: API call successful, but no config_data returned (e.g., config not found in DB)
                // This means apiResponse was valid, but its config_data field was empty or null.
                else if (apiResponse && !apiResponse.config_data) {
                    message = "No UI configuration detected in the backend. Default configuration has been loaded.";
                    type = 'warning'; // Set alert type to warning
                    console.warn(message);
                    // configToSet is already DEFAULT_UI_CONFIG
                }

            } catch (err: any) {
                if (err.message && err.message.includes('API returned a failure:')) {
                    message = `No UI configuration detected in the backend. Default configuration has been loaded. Error: ${err.message}`;
                    type = 'warning'; // Still a warning if no config, even if API reported failure
                    console.warn(message);
                } else {
                    message = `Failed to fetch UI configuration from the backend. Default configuration has been loaded. Error: ${err.message || String(err)}.`;
                    type = 'error'; // Set alert type to error for general failures
                    console.error(`Error loading UI configuration: ${err}`);
                }
                // configToSet remains DEFAULT_UI_CONFIG in all catch scenarios.
            } finally {
                // Always set a configuration (either fetched or default)
                setDashboardContext({
                    payload: { configuration: configToSet },
                    type: 'ui_config/set',
                });
                if (message) {
                    showAlert(message, type, undefined, 'Configuration Alert:'); // NEW: Call showAlert from context
                }
            }
        };

        // Call the async function when the component mounts
        fetchConfig();
    }, [setDashboardContext, showAlert]); // Dependency array includes showAlert

    // REMOVED: All alert-related state (alertState, isAlertDismissing) and effects (auto-dismissal useEffect)
    // REMOVED: handleDismissAlert function

    return <></>; // This component no longer renders the alert UI directly
};

