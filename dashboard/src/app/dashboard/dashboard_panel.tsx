// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { useEffect, useState } from 'react';

import IOConfigurationContainer from '@/app/io_configuration/io_configuration_container';
import { PlotPanel } from '@/app/charts/PlotPanel';
import JogPanel from '@/app/jog/jog_panel';
import { PagePanel } from '@/lib/components/client_components/DashboardHeaderContainer';
import { UiConfig, uiConfigSchema } from '@/lib/models/ui_configuration';
import LoadingIndicator from '@/lib/components/server_components/loading_indicator';
import { fetchFromBackendApi } from '@/lib/utils/timeoutFetch';

export default function DashboardMainPanel(props: { className?: string }) {
    const [fillTile, setFillTile] = useState<string>('');

    const grid_state = () =>
        fillTile == ''
            ? 'grid grid-cols-[50%_50%] grid-rows-auto'
            : 'grid grid-cols-1 grid-rows-1 h-full';

    const tile_hidden = (tile_name: string) =>
        fillTile != tile_name && fillTile != '' ? 'hidden' : '';

    const [validatedConfig, setValidatedConfig] = useState<UiConfig | null>(
        null
    );

    // const handleSerialize = () => {
    //     if (!validatedConfig) {
    //         console.error('No validated configuration to serialize.');
    //         // setSerializableJson('');
    //         return;
    //     }

    //     // Use JSON.stringify() to convert the object back to a string.
    //     // The Zod schema ensures the object has the correct shape for serialization.
    //     try {
    //         const serializedData = JSON.stringify(validatedConfig, null, 2);
    //         return serializedData;
    //         // setSerializableJson(serializedData);
    //         // setErrors([]);
    //     } catch (e) {
    //         console.error(`Serialization Error: ${e.message}`);
    //     }
    // };

    // The useEffect hook runs after the component renders
    useEffect(() => {
        // Define an async function to handle the API call
        const fetchConfig = async () => {
            try {
                const validatedData = await fetchFromBackendApi<UiConfig>(
                    '/api/backend/ui/config/abc',
                    uiConfigSchema
                );

                setValidatedConfig(validatedData as UiConfig);
                
                console.log(
                    `Got UI configuration: ${JSON.stringify(validatedData)}`
                );
            } catch (err) {
                console.error(`Error loading UI configuration: ${err}`);
            }
        };

        // Call the async function
        fetchConfig();
    }, []); // The empty dependency array [] ensures this effect runs only once on mount

    return (
        <PagePanel
            className={`
        ${grid_state()}
        gap-y-2
        transition-all
        overflow-y-scroll
        ${props.className ?? ''}
      `}
        >
            {validatedConfig ? (
                <>
                    <JogPanel
                        id="jogging_panel"
                        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
                            'jogging_panel'
                        )} ${fillTile === 'jogging_panel' ? 'h-full' : 'min-h-[400px] overflow-y-auto'}`}
                    />

                    <IOConfigurationContainer
                        id="io_configuration"
                        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
                            'io_configuration'
                        )} ${fillTile === 'io_configuration' ? 'h-full' : 'min-h-[400px] overflow-y-auto'}`}
                        fill_tile_callback={setFillTile}
                    />
                    <PlotPanel id={'plots'} />
                </>
            ) : (
                <>
                    <p>WAITING FOR UI CONFIG</p>
                    <LoadingIndicator />
                </>
            )}

            {/* <IOPlotPanel
                id="io_plot"
                className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
                    'io_plot'
                )}`}
                fill_tile_callback={setFillTile}
            />

            <MotionPlotPanel
                id="motion_plot"
                className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
                    'motion_plot'
                )}`}
                fill_tile_callback={setFillTile}
            /> */}
        </PagePanel>
    );
}
