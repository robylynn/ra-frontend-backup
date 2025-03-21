// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { R2Button } from '@/lib/components/client_components/ClickButton';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import React, { useContext } from 'react';

// TODO: jogging button for different distances, axis jog direction, add home, and reset

interface JogAxisProps {
    axis: string;
}

const JogAxis: React.FC<JogAxisProps> = ({ axis }) => {
    return (
        <div className="flex w-full grid grid-cols-5 items-center justify-center p-4 gap-4">
            <R2Button className="flex-grow" text="Jog -2 " onClick={() => {}} />
            <R2Button className="flex-grow" text="Jog -1 " onClick={() => {}} />
            <div className="flex flex-col items-center justify-center text-white">
                <h2> Jog Axis {axis}</h2>
            </div>
            <R2Button className="flex-grow" text="Jog +1" onClick={() => {}} />
            <R2Button className="flex-grow" text="Jog +2" onClick={() => {}} />
        </div>
    );
};

const JogPanel = () => {
    return (
        <div className="flex flex-col w-full items-center justify-center h-full">
            <JogAxis axis="0" />
            <JogAxis axis="1" />
            <JogAxis axis="2" />
            <JogAxis axis="3" />
        </div>
    );
};

const JogContainer = () => {
    const { dashboardContext } = useContext(DashboardContext);

    return <JogPanel />;
};

export default JogContainer;
