// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { ReactElement, useContext } from 'react';

import {
    DashboardHeaderContainer,
    PagePanel,
} from '@/lib/components/client_components/DashboardHeaderContainer';
import LoadingIndicator from '@/lib/components/server_components/loading_indicator';
import { DashboardContext } from './DashboardContextWrapper';

interface MessageContainerInterface {
    className?: string;
}

export default function MessageContainer(props: MessageContainerInterface) {
    const { dashboardContext } = useContext(DashboardContext);

    const messages = (): ReactElement[] => {
        const m: ReactElement[] = [];
        let message_index = 0;
        if (dashboardContext.messages == undefined) {
            return m;
        }

        for (const message_document of dashboardContext.messages.documents) {
            m.push(
                <p
                    key={message_index}
                    className="dark:text-r2-white"
                >{`${message_document.timestamp} ${message_document.message}`}</p>
            );
            message_index++;
        }

        return m.reverse();
    };

    return (
        <PagePanel className={`${props.className ?? ''}`}>
            <DashboardHeaderContainer
                header_text="SYSTEM LOG"
                icon_path="/icons/messages.svg"
                fill_tile_id={'message_container'}
            >
                {dashboardContext.ra_ros_websocket.isConnected ? (
                    <div className="">
                        <div className="flex flex-col-reverse w-full h-full p-0 px-5 m-0 space-y-0 text-xs rounded-sm grow dark:text-r2-white">
                            {messages()}
                        </div>
                    </div>
                ) : (
                    <LoadingIndicator />
                )}
            </DashboardHeaderContainer>
        </PagePanel>
    );
}
