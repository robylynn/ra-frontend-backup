// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { Dispatch, SetStateAction, useContext } from 'react';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import JogContainer from '@/lib/components/client_components/JogContainer';

export default function JogPanel(props: {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
}) {
    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);

    return (
        <DashboardHeaderContainer
            header_text={'Jog'}
            icon_path={'/icons/sliders.svg'}
            className={`${props.className ?? ''}`}
            fill_tile_id={props.id}
            fill_tile_callback={props.fill_tile_callback}
        >
            <JogContainer />
        </DashboardHeaderContainer>
    );
}
