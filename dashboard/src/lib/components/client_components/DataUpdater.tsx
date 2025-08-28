// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { useContext, useEffect, useState } from 'react';

import { uiConfigSchema, UiConfig, UiConfigApiResponse, uiConfigApiResponseSchema } from '@/lib/models/ui_configuration';
import { fetchFromBackendApi } from '@/lib/utils/timeoutFetch';

export const SimpleDataUpdater = () => {
    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);

    useEffect(() => {
        // Define an async function to handle the API call
        const fetchConfig = async () => {
            try {
                const validatedData = await fetchFromBackendApi<UiConfigApiResponse>(
                    '/api/backend/ui/config/abc',
                    uiConfigApiResponseSchema
                );

                // setValidatedConfig(validatedData as UiConfig);
                
                setDashboardContext({
                    payload: { configuration: validatedData.config_data as UiConfig },
                    type: 'ui_config/set',
                });

                console.log(
                    `Got UI configuration: ${JSON.stringify(validatedData.config_data)}`
                );
            } catch (err) {
                console.error(`Error loading UI configuration: ${err}`);
            }
        };

        // Call the async function
        fetchConfig();
    }, []); // The empty dependency array [] ensures this effect runs only once on mount

    return <></>
}