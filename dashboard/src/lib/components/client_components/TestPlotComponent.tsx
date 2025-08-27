'use client';

import { RAServerWebSocket } from '@/lib/components/client_components/WebsocketClient';
import React, { useCallback, useState } from 'react';
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
import LoadingIndicator from '@/lib/components/server_components/loading_indicator';

interface PlotProperties {
    table_name: string,
    column: string
}

export const TestPlotComponent: React.FC<PlotProperties> = (
    // props: DashboardHeaderContainerProps
    props: PlotProperties
) => {
    const [chartData, setChartData] = useState([]);
    const [logMessages, setLogMessages] = useState([]);

    const logMessage = useCallback((text, type = 'info') => {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        console.log(`[${timeString}] ${text}`);
        setLogMessages((prevLogs) => {
            const newLog = {
                id: Date.now(),
                text: `[${timeString}] ${text}`,
                type,
            };
            return [newLog, ...prevLogs].slice(0, 20); // Keep max 20 logs
        });
    }, []);

    const websocketMessageCallback = (data) => {
        // console.log(data);
        logMessage(`Received: ${data}`, 'received');
        try {
            const receivedData = JSON.parse(data);
            // Check for the "historical" data type and parse it
            if (receivedData.type === 'historical') {
                const parsedData = parseHistoricalData(receivedData);
                setChartData(parsedData);
            } else if (receivedData.type === 'live') {
                const parsedData = parseLiveData(receivedData);
                setChartData((prevData) => {
                    let a = 5;
                    return [...prevData, parsedData].slice(-100);
                });
            } else if (typeof receivedData.value === 'number') {
                // Original logic for single data points
                setChartData((prevData) => {
                    const newDataPoint = {
                        name: `Point ${prevData.length + 1}`,
                        value: receivedData.value,
                    };
                    return [...prevData, newDataPoint].slice(-10);
                });
            } else {
                logMessage(
                    'Received message is not valid data for chart.',
                    'info'
                );
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
            value: rawData.data[props.column], // We'll plot temperature for now
        };
        // // Map the historical data to the format Recharts expects: [{ name: '...', value: ... }]
        // return rawData.data.map((item) => ({
        //     name: new Date(item.time).toLocaleTimeString(),
        //     value: item.temperature, // We'll plot temperature for now
        // }));
    };

    const parseHistoricalData = (rawData) => {
        // Check if the data is valid and has a 'data' array
        if (!rawData || !rawData.data || !Array.isArray(rawData.data)) {
            return [];
        }
        // Map the historical data to the format Recharts expects: [{ name: '...', value: ... }]
        return rawData.data.map((item) => ({
            time: new Date(item.time).toLocaleTimeString(),
            value: item[props.column], // We'll plot temperature for now
        }));
    };

    return (
        <>
            <RAServerWebSocket
                websocketUrl={`/api/socket?target=stream&table_name=${props.table_name}&historical_limit=100`}
                reconnectInterval={3000}
                callback={websocketMessageCallback}
            />
            {/* <LineChartComponent chartData={chartData} /> */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Data Visualization
                </h1>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            // data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                            />
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
                    <LoadingIndicator/>
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
        </>
    );
};
