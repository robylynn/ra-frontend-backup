// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { Dispatch, SetStateAction, useState } from 'react';

import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import IOPointGroup from '@/lib/components/client_components/IOPointGroup';
import { IOPointType } from '@/lib/models/api_models';

export default function IOConfigurationContainer(props: {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
}) {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    return (
        <DashboardHeaderContainer
            header_text={'IO CONFIGURATION'}
            icon_path={'/icons/sliders.svg'}
            className={`${props.className ?? ''}`}
            fill_tile_id={props.id}
            fill_tile_callback={props.fill_tile_callback}
            loading={loading}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage('')}
        >
            <div className="flex flex-col gap-y-4 h-full overflow-y-auto">
                <IOPointGroup
                    point_type={IOPointType.ANALOG_INPUT}
                    group_name="Analog Input"
                    setLoading={(loading: boolean) => setLoading(loading)}
                    setErrorMessage={setErrorMessage}
                />
                <IOPointGroup
                    point_type={IOPointType.ANALOG_OUTPUT}
                    group_name="Analog Output"
                    setLoading={(loading: boolean) => setLoading(loading)}
                    setErrorMessage={setErrorMessage}
                />
                <IOPointGroup
                    point_type={IOPointType.DIGITAL_INPUT}
                    group_name="Digital Input"
                    setLoading={(loading: boolean) => setLoading(loading)}
                    setErrorMessage={setErrorMessage}
                />
                <IOPointGroup
                    point_type={IOPointType.DIGITAL_OUTPUT}
                    group_name="Digital Output"
                    setLoading={(loading: boolean) => setLoading(loading)}
                    setErrorMessage={setErrorMessage}
                />
            </div>
        </DashboardHeaderContainer>
    );
}
