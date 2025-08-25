// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { Dispatch, SetStateAction, useContext } from 'react';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import IODisplay from '@/lib/components/client_components/IODisplay';
import LoadingIndicator from '@/lib/components/server_components/loading_indicator';

export default function IOStateContainer(props: {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
}) {
    const { dashboardContext } = useContext(DashboardContext);

    return (
        <DashboardHeaderContainer
            header_text={'IO STATE'}
            icon_path={'/icons/sliders.svg'}
            className={`${props.className ?? ''}`}
            fill_tile_id={props.id}
            fill_tile_callback={props.fill_tile_callback}
        >
            {dashboardContext.configuration?.configured ? (
                <IODisplay />
            ) : (
                <LoadingIndicator />
            )}
        </DashboardHeaderContainer>
    );
}
