// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { PagePanel } from '@/lib/components/client_components/DashboardHeaderContainer';
// import { DatabaseDocumentInterface } from '@/lib/models/database_models';
import { Icon } from '@blueprintjs/core';
import { ReactNode, useContext } from 'react';

function IndicatorLight(props: { text: string; state: boolean }) {
    const indicator_color = props.state ? 'red' : '#8F99A8';

    return (
        <>
            <Icon
                icon={'full-circle'}
                className={`p-2`}
                color={indicator_color}
                size={25}
            />
            <p className="p-0 m-0 text-center dark:text-[#ECECEC]/[.83]">
                {props.text}
            </p>
        </>
    );
}

function RoundedContainer(props: { className?: string; children?: ReactNode }) {
    return (
        <div
            className={`flex flex-row px-5 mx-5 space-x-6 border rounded-full border-r2-green-300 place-items-center ${props.className ?? ''}`}
        >
            {props.children}
        </div>
    );
}

export default function Header(props: {
    // data_sample?: DatabaseDocumentInterface;
    className?: string;
}) {
    const { dashboardContext: context } = useContext(DashboardContext);

    return (
        <PagePanel
            className={`
            flex 
            flex-row 
            justify-around 
            my-1 
            place-items-center
            border-r-0
            rounded-r-none
            ${props.className ?? ''}
            `}
        >
            <RoundedContainer className="text-xl font-bold dark:text-white">
                R2 Autonomy Controller
            </RoundedContainer>
        </PagePanel>
    );
}
