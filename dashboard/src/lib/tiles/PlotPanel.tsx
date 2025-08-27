import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import { TestPlotComponent } from '@/lib/components/client_components/TestPlotComponent';
import { DashboardHeaderContainerProps } from '@/lib/models/dashboard_types';
import React from 'react';

export const PlotPanel: React.FC<DashboardHeaderContainerProps> = (
    props: DashboardHeaderContainerProps
) => {
    return (
        <>
            <DashboardHeaderContainer
                header_text={'TEST PLOT'}
                icon_path={'/icons/sliders.svg'}
                className={`${props.className ?? ''}`}
                fill_tile_id={props.id}
                fill_tile_callback={props.fill_tile_callback}
            >
                <TestPlotComponent
                    table_name="sensor_data"
                    column="temperature"
                />
            </DashboardHeaderContainer>
        </>
    );
};
