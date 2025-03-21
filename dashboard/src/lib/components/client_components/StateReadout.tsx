// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { useContext } from 'react';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';

export default function StateReadout(props: { className?: string }) {
    const { dashboardContext } = useContext(DashboardContext);

    return (
        <div>
            <p
                className={`text-center font-bold m-2 p-2 dark:bg-green-400 bg-red-400 rounded-xl ${
                    props.className ?? ''
                }`}
            >
                {/* {"NOT IMPLEMENTED"} */}
                {'AUTOMATIC'}
            </p>
        </div>
    );
}
