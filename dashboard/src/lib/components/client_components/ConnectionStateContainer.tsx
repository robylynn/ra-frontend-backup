// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useContext, useEffect, useState } from 'react';
// import { auth } from '@/auth';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';

export default function ConnectionStateIndicator(props: {
    className?: string;
}) {
    const { dashboardContext } = useContext(DashboardContext);
    // const [isClient, setIsClient] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { data: session } = useSession();
    // const session = await auth();

    // This effect updates the time every second.
    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const connected_color = session ? 'bg-r2-green-500' : 'bg-r2-red-300';
    const connection_text = session ? `APPLICATION SERVER ONLINE` : 'NOT LOGGED IN';

    let x = dashboardContext;
    const websocketText = useCallback(() => {
        const websocket_connected = dashboardContext?.ros_state?.connected
            ? true
            : false;
        return websocket_connected
            ? 'CONNECTED TO ROS'
            : 'WAITING FOR ROS BACKEND';
    }, [dashboardContext])

    const websocketConnected = useCallback(() => {
        return dashboardContext?.ros_state?.connected ? true : false;
    }, [dashboardContext])

    // const websocket_text = () => {
    //     const websocket_connected = dashboardContext?.ros_state?.connected
    //         ? true
    //         : false;
    //     const text = websocket_connected
    //         ? 'WEBSOCKET CONNECTED'
    //         : 'WAITING FOR WEBSOCKET';

    //     return (
    //         <p
    //             className={`py-0 m-0 mx-2 font-bold text-center rounded-md text-r2-white ${websocket_connected ? 'bg-r2-green-500' : 'bg-r2-red-300'}`}
    //         >
    //             {text}
    //         </p>
    //     );
    // };

    return (
        <div
            className={`w-full h-fit px-2 grid grid-cols-3 justify-between bg-none items-center text-sm ${
                props.className ?? ''
            }`}
        >
            {/* {websocket_text()} */}
            <p
                className={`py-0 m-0 mx-2 font-bold text-center rounded-md text-r2-white ${websocketConnected() ? 'bg-r2-green-500' : 'bg-r2-red-300'}`}
            >
                {websocketText()}
            </p>
            <p
                className={`px-2 text-center text-r2-white font-bold rounded-md py-0 m-0 ${connected_color}`}
            >
                {connection_text}
            </p>
            <p className="py-0 m-0 text-xs text-center text-r2-white">{`SYSTEM TIME: ${currentTime.toString().toUpperCase()}`}</p>
        </div>
    );
}

export function ConnectionStateIndicator2(props) {
    // We use our mock context here instead of the real one.
    const { dashboardContext } = useContext(DashboardContext);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { data: session } = useSession();

    // This effect updates the time every second.
    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    // Determine colors and text based on mock context and session
    const isConnected = session ? true : false;
    const connectedColor = isConnected ? 'bg-green-500' : 'bg-red-300';
    const connectionText = session
        ? isConnected
            ? 'BACKEND SERVER ONLINE'
            : 'BACKEND SERVER OFFLINE'
        : 'NOT LOGGED IN';

    const isWebsocketConnected = dashboardContext?.ros_state?.connected;
    const websocketColor = isWebsocketConnected ? 'bg-green-500' : 'bg-red-300';
    const websocketText = isWebsocketConnected
        ? 'WEBSOCKET CONNECTED'
        : 'WAITING FOR WEBSOCKET';

    return (
        <div
            className={`w-full h-fit p-4 grid grid-cols-3 gap-4 justify-between bg-zinc-800 items-center text-sm font-sans rounded-lg shadow-inner ${props.className ?? ''}`}
        >
            {/* WebSocket Status */}
            <div className="flex flex-col items-center">
                <p
                    className={`p-2 font-bold text-center rounded-md text-white ${websocketColor}`}
                >
                    {websocketText}
                </p>
                <span className="text-white text-xs mt-1 opacity-75">
                    WebSocket
                </span>
            </div>

            {/* Backend Server Status */}
            <div className="flex flex-col items-center">
                <p
                    className={`p-2 text-center text-white font-bold rounded-md ${connectedColor}`}
                >
                    {connectionText}
                </p>
                <span className="text-white text-xs mt-1 opacity-75">
                    Backend Server
                </span>
            </div>

            {/* System Time */}
            <div className="flex flex-col items-center">
                <p className="p-2 text-xs text-center text-white font-mono">
                    {currentTime.toLocaleTimeString().toUpperCase()}
                </p>
                <span className="text-white text-xs mt-1 opacity-75">
                    System Time
                </span>
            </div>
        </div>
    );
}
