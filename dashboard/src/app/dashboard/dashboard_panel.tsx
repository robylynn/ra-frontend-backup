// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { useEffect, useState, useContext } from 'react';

// import { PlotPanel } from '@/app/charts/PlotPanel';
// import JogPanel from '@/lib/components/tiles/JogPanel';
import { ComponentMap } from '@/lib/components/client_components/ComponentMap';
import { PagePanel } from '@/lib/components/client_components/DashboardHeaderContainer';
import LoadingIndicator from '@/lib/components/server_components/loading_indicator';
import { UiConfig, uiConfigSchema } from '@/lib/models/ui_configuration';
import { fetchFromBackendApi } from '@/lib/utils/timeoutFetch';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';

export default function DashboardMainPanel(props: { className?: string }) {
    const [fillTile, setFillTile] = useState<string>('');

    const grid_state = () =>
        fillTile == ''
            ? 'grid grid-cols-[50%_50%] grid-rows-auto'
            : 'grid grid-cols-1 grid-rows-1 h-full';

    const tile_hidden = (tile_name: string) =>
        fillTile != tile_name && fillTile != '' ? 'hidden' : '';

    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);

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
            {dashboardContext.ui_configuration ? (
                <>
                    {dashboardContext.ui_configuration.components.map(
                        (componentConfig) => {
                            // Look up the component from our map based on its type.
                            const Component =
                                ComponentMap[componentConfig.type];

                            // Check if the component exists in the map.
                            if (!Component) {
                                console.error(
                                    `Component type "${componentConfig.type}" not found in the component map.`
                                );
                                return null; // Don't render anything if the type is unknown.
                            }

                            // Use the `id` from the API as the React key.
                            return (
                                <Component
                                    key={componentConfig.id}
                                    //{...componentConfig.props}
                                />
                            );
                        }
                    )}
                </>
            ) : (
                <>
                    <div>
                        <p>WAITING FOR UI CONFIG</p>
                        <LoadingIndicator />
                    </div>
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
