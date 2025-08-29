// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { useContext, useState } from 'react';

// import { PlotPanel } from '@/app/charts/PlotPanel';
// import JogPanel from '@/lib/components/tiles/JogPanel';
import { ComponentMap } from '@/lib/utils/ComponentMap';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { PagePanel } from '@/lib/components/client_components/DashboardHeaderContainer';
import LoadingIndicator from '@/lib/components/server_components/LoadingIndicator';

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
                    {/* <CameraStreamPanel
                        id="camera_panel"
                        cameraId="camera0"
                        className={`bg-purple-800 col-span-1 row-start-1 peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
                            'camera_panel'
                        )} ${fillTile === 'camera_panel' ? 'h-full' : 'min-h-[200px]'}`}
                        // fill_tile_callback={setFillTile}
                    /> */}
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
