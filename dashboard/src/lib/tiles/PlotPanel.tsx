'use client';

import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import React from 'react';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
// import { PlotComponentFactory } from '@/lib/components/client_components/PlotComponent';
import { DashboardHeaderContainerProps } from '@/lib/models/dashboard_types';
import { useContext } from 'react';

export const PlotPanel: React.FC<DashboardHeaderContainerProps> = (
    props: DashboardHeaderContainerProps
) => {
    const { dashboardContext } = useContext(DashboardContext);

    // const renderedPlots = () => {
    //     return dashboardContext.ui_configuration.components.map(
    //         (component) => {
    //             if (component.type === 'charts') {
    //                 const PlotComponent = PlotComponentFactory();
    //                 return (
    //                     <PlotComponent
    //                         traces={component.metadata.traces.map(
    //                             (trace) => trace
    //                         )}
    //                         max_length={component.metadata.max_length}
    //                     />
    //                 );
    //             }
    //         }
    //     );
    // };

    // const plots = renderedPlots();

    // const SensorDataPlot = PlotComponentFactory<sensorDataBatch>();
    // const AxisPositionPlot = PlotComponentFactory<axisEstimates>();

    return (
        <>
            <DashboardHeaderContainer
                header_text={'TEST PLOT'}
                icon_path={'/icons/sliders.svg'}
                className={`${props.className ?? ''}`}
                fill_tile_id={props.id}
                fill_tile_callback={props.fill_tile_callback}
            >
                {/* {renderedPlots()}*/}
                <p>EMPTY</p>
            </DashboardHeaderContainer>
        </>
    );
};
