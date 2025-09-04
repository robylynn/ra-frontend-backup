// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { useContext, useEffect } from 'react'; // useState is still used for internal component state, not alerts

import { useAlert } from '@/lib/components/client_components/AlertContext'; // NEW: Import useAlert hook
import { AlertType } from '@/lib/components/client_components/AlertPopup';
import {
    availableTables,
    availableTablesSchema,
} from '@/lib/models/api_models';
import {
    DEFAULT_UI_CONFIG,
    UiConfig,
    UiConfigApiResponse,
    uiConfigApiResponseSchema,
} from '@/lib/models/ui_configuration';
import {
    asyncExponentialBackoffRetry,
    fetchFromBackendApi,
} from '@/lib/utils/timeoutFetch';
import { logMessage } from '@/lib/utils/utilities';

export const DataUpdater = () => {
    const { setDashboardContext } = useContext(DashboardContext);
    const { showAlert } = useAlert(); // NEW: Use the showAlert function from context

    useEffect(() => {
        // Define an async function to handle the API call and configuration logic
        const fetchConfig = async () => {
            let configToSet: UiConfig = DEFAULT_UI_CONFIG; // Start with default config
            let message: string | null = null; // Message for potential alerts
            let type: AlertType = 'warning'; // Default alert type

            try {
                const apiResponse: UiConfigApiResponse =
                    await asyncExponentialBackoffRetry(() =>
                        fetchFromBackendApi<UiConfigApiResponse>(
                            '/api/backend/ui/config/abc',
                            'GET',
                            null,
                            uiConfigApiResponseSchema
                        )
                    );

                if (apiResponse && apiResponse.config_data) {
                    configToSet = apiResponse.config_data;
                    message = `UI configuration successfully loaded. Client ID: ${apiResponse.client_id}, Last Updated: ${new Date(apiResponse.last_updated).toLocaleString()}.`;
                    type = 'success';
                    logMessage(
                        `Got UI configuration: ${JSON.stringify(configToSet)}`,
                        'info'
                    );
                } else {
                    message =
                        'No UI configuration detected in the backend. Default configuration has been loaded.';
                    type = 'warning';
                    console.warn(message);
                }
            } catch (err: any) {
                message = `Failed to fetch UI configuration from the backend after multiple retries. Default configuration has been loaded. Error: ${err.message || String(err)}.`;
                type = 'error';
                console.error(`Final error loading UI configuration: ${err}`);
            } finally {
                setDashboardContext({
                    payload: { configuration: configToSet },
                    type: 'ui_config/set',
                });
                if (message) {
                    showAlert(message, type, undefined, 'Configuration Alert:');
                }
            }
        };

        const fetchTables = async () => {
            let message: string | null = null; // Message for potential alerts
            let type: AlertType = 'warning'; // Default alert type

            try {
                const apiResponse: availableTables =
                    await asyncExponentialBackoffRetry(() =>
                        fetchFromBackendApi<availableTables>(
                            '/api/backend/status/tables',
                            'GET',
                            null,
                            availableTablesSchema
                        )
                    );

                if (apiResponse) {
                    message = `Got available tables: ${apiResponse.map((table_def) => `${table_def.table_name}`).join(', ')}`;
                    type = 'success';
                    logMessage(message, 'info');

                    setDashboardContext({
                        payload: { tables: apiResponse },
                        type: 'database/tables/set',
                    });
                } else {
                    message = `Backend has no available database tables`;
                    type = 'warning';
                    logMessage(message, type);
                }
            } catch (err: any) {
                message = `Failed to fetch available database tables from the backend after multiple retries. Error: ${err.message || String(err)}.`;
                type = 'error';
                logMessage(message, type);
                // console.error(`Final error loading UI configuration: ${err}`);
            } finally {
                if (message) {
                    showAlert(message, type, undefined, 'Database Alert:');
                }
            }
        };

        // Call the async function when the component mounts
        fetchConfig();
        fetchTables();
        fetchConfigs();
    }, [setDashboardContext]);

    return <></>; // This component no longer renders the alert UI directly
};
