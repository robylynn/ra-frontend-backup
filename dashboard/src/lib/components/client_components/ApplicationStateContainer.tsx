'use client';

import { ReactElement } from 'react';
import { PagePanel } from './DashboardHeaderContainer';

function ApplicationState(props: {
    className?: string;
    state?: string;
}): ReactElement {
    const { className, state = 'Running' } = props;

    return (
        <div
            className={`
                p-2 
                bg-gray-900 
                text-white 
                rounded-lg 
                shadow-lg 
                border 
                border-r2-green-300 
                flex 
                flex-row 
                justify-between 
                items-center 
                w-[40%] 
                ${className}`}
        >
            {/* State Text on the Left */}
            <p className="text-lg font-semibold">
                State: <span className="text-green-400">{state}</span>
            </p>

            {/* Emergency Stop Button on the Right */}
            <button className="px-2 py-1 height-[60%] bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition">
                Emergency Stop
            </button>
        </div>
    );
}

export function ApplicationStateContainer(props: { className?: string }) {
    return (
        <PagePanel
            className={`
              flex 
              flex-row 
              justify-end
              my-1
              px-2 
              place-items-center
              border-l-0
              rounded-l-none
              shadow-none
              ${props.className ?? ''}
              `}
        >
            <ApplicationState className={props.className} />
        </PagePanel>
    );
}
