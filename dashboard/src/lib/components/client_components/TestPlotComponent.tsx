'use client';

import {
    useWebSocket,
    WebSocketMessage,
} from '@/lib/components/client_components/WebsocketSubscriptionProvider';
import LoadingIndicator from '@/lib/components/server_components/LoadingIndicator';
import { logMessage } from '@/lib/utils/utilities';
import React, { useEffect, useState } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface PlotProperties {
    table_name: string;
    column: string;
}

export const TestPlotComponent: React.FC<PlotProperties> = (
    props: PlotProperties
) => {
    const [chartData, setChartData] = useState([]);
    const { registerMessageListener, subscribe, unsubscribe, isConnected } =
        useWebSocket();

    // This effect registers and unregisters the listener
    useEffect(() => {
        if (!isConnected) return; // Only register if connected

        const listenerId = 'sensor_data';

        // Register to listen for 'live' messages from 'special_alerts_table'
        const unregister_listener = registerMessageListener(
            listenerId,
            websocketMessageCallback,
            {
                types: ['live', 'historical'],
                table: 'sensor_data',
            }
        );

        subscribe('sensor_data', true, 50);

        return () => {
            unsubscribe('sensor_data');
            unregister_listener(); // Clean up listener when component unmounts or isConnected changes
        };
    }, [isConnected, registerMessageListener]); // Re-register if connection status or register function changes

    const websocketMessageCallback = (message: WebSocketMessage) => {
        logMessage(`Plot received: ${JSON.stringify(message)}`, 'received');
        try {
            if (message) {
                if (message.type === 'historical') {
                    const parsedData = parseHistoricalData(message);
                    setChartData(parsedData);
                } else if (message.type === 'live') {
                    const parsedData = parseLiveData(message);
                    setChartData((prevData) => {
                        return [...prevData, parsedData].slice(-100);
                    });
                } else {
                    logMessage(
                        'Received message is not valid data for chart.',
                        'info'
                    );
                }
            } else {
                logMessage('Received message has no data.', 'info');
            }
        } catch (e) {
            logMessage('Received message is not valid JSON.', 'info');
        }
    };

    const parseLiveData = (rawData) => {
        if (!rawData || !rawData.data) {
            return [];
        }
        return {
            time: new Date(rawData.data.time).toLocaleTimeString(),
            value: rawData.data[props.column],
        };
    };

    const parseHistoricalData = (rawData) => {
        // Check if the data is valid and has a 'data' array
        if (!rawData || !rawData.data || !Array.isArray(rawData.data)) {
            return [];
        }
        // Map the historical data to the format Recharts expects: [{ name: '...', value: ... }]
        return rawData.data.map((item) => ({
            time: new Date(item.time).toLocaleTimeString(),
            value: item[props.column],
        }));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                {`${props.table_name} : ${props.column}`}
            </h1>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="time"
                            stroke="#6b7280"
                            label={{
                                value: 'Time',
                                position: 'insideBottom',
                                offset: -5,
                            }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            label={{
                                value: 'Temperature',
                                angle: -90,
                                position: 'insideLeft',
                                dy: 45,
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#1f2937' }}
                        />
                        <Legend />
                        <Line
                            data={chartData}
                            key={'time'}
                            type="monotone"
                            dataKey="value"
                            stroke="#8884d8"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            // animateNewValues={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <LoadingIndicator text='WAITING FOR WEBSOCKET'/>
                // <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg border border-gray-200 text-center">
                //     <svg
                //         className="animate-spin h-8 w-8 text-gray-400 mb-4"
                //         xmlns="http://www.w3.org/2000/svg"
                //         fill="none"
                //         viewBox="0 0 24 24"
                //     >
                //         <circle
                //             className="opacity-25"
                //             cx="12"
                //             cy="12"
                //             r="10"
                //             stroke="currentColor"
                //             strokeWidth="4"
                //         ></circle>
                //         <path
                //             className="opacity-75"
                //             fill="currentColor"
                //             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                //         ></path>
                //     </svg>
                //     <p className="text-gray-500 font-medium">
                //         Waiting for data...
                //     </p>
                // </div>
            )}
        </div>
    );
};
