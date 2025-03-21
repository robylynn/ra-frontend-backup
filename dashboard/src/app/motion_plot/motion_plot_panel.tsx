// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { Dispatch, SetStateAction, useContext } from 'react';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import { MotionPlotContainer } from '@/lib/components/client_components/MotionPlotContainer';
import { NextAPIResponseInterface } from '@/lib/models/api_models';
import { save_UI_configuration } from '@/lib/utils/saveUIConfiguration';

export default function MotionPlotPanel(props: {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
}) {
    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);
    const save_configuration = async () => {
        // let savedContext = dashboardContext.cop
        let saved_configuration = dashboardContext.configuration.copy();
        saved_configuration.saved_motion_plot_configuration =
            dashboardContext.configuration.motion_plots;

        const res: NextAPIResponseInterface =
            await save_UI_configuration(saved_configuration);

        setDashboardContext({
            payload: {},
            type: 'motion_plots/save',
        });

        // const res: NextAPIResponseInterface = await fetch(
        //   "api/backend/ui/configuration",
        //   {
        //     method: "POST",
        //     headers: {
        //       Accept: "application/json",
        //       "Content-Type": "application/json",
        //     },
        //     mode: "cors",
        //     body: dashboardContext.configuration.serialize_saved_confiuration(),
        //   }
        // ).then((res) => res.json());
        console.log('POST response: ' + JSON.stringify(res.data));
    };

    return (
        <DashboardHeaderContainer
            header_text={'MOTION PLOT'}
            icon_path={'/icons/sliders.svg'}
            className={`${props.className ?? ''}`}
            fill_tile_id={props.id}
            fill_tile_callback={props.fill_tile_callback}
            button_active={dashboardContext.configuration.configured}
            button_text="Save Configuration"
            button_callback={() => {
                save_configuration();
            }}
        >
            <MotionPlotContainer />
        </DashboardHeaderContainer>
    );
}
