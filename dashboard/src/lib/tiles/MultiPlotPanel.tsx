import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCustomToken,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
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
import { v4 as uuidv4 } from 'uuid';

// --- Global Firebase Config & Variables ---
const firebaseConfig =
    typeof __firebase_config !== 'undefined'
        ? JSON.parse(__firebase_config)
        : {};
const initialAuthToken =
    typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- INLINE SVG ICONS ---
const ChartLineIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-line-chart"
    >
        <path d="M3 3v18h18" />
        <path d="m18 9-5 5-4-4-3 3" />
    </svg>
);

const TrashIcon = ({ size = 12 }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-trash-2"
    >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
);

const SpinnerIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-loader-2"
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const SettingsIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-settings-2"
    >
        <path d="M20 7h-9" />
        <path d="M14 17h-5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const SaveIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-save"
    >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

const LoadIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-folder-down"
    >
        <path d="M15 17L12 20L9 17" />
        <path d="M12 10V20" />
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 4.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
);

// --- MOCKED COMPONENTS & TYPES ---
const WebSocketContext = createContext(null);
const AlertContext = createContext(null);
const FirebaseContext = createContext(null);

const MOCKED_TABLE_SCHEMA_MAP = {
    sensorDataBatch: {
        stamp: 'number',
        temperature: 'number',
        humidity: 'number',
    },
    axisEstimates: {
        stamp: 'number',
        x_position: 'number',
        y_position: 'number',
    },
};

const MOCKED_DATA = {
    sensorDataBatch: [
        { stamp: Date.now() - 5000, temperature: 25, humidity: 45 },
        { stamp: Date.now() - 4000, temperature: 26, humidity: 46 },
        { stamp: Date.now() - 3000, temperature: 27, humidity: 47 },
        { stamp: Date.now() - 2000, temperature: 28, humidity: 48 },
        { stamp: Date.now() - 1000, temperature: 29, humidity: 49 },
        { stamp: Date.now(), temperature: 30, humidity: 50 },
    ],
    axisEstimates: [
        { stamp: Date.now() - 5000, x_position: 10, y_position: 20 },
        { stamp: Date.now() - 4000, x_position: 11, y_position: 21 },
        { stamp: Date.now() - 3000, x_position: 12, y_position: 22 },
        { stamp: Date.now() - 2000, x_position: 13, y_position: 23 },
        { stamp: Date.now() - 1000, x_position: 14, y_position: 24 },
        { stamp: Date.now(), x_position: 15, y_position: 25 },
    ],
};

const WebSocketProvider = ({ children }) => {
    const messageListeners = useRef(new Map());
    const [isConnected, setIsConnected] = useState(true);

    const registerMessageListener = useCallback((id, callback) => {
        messageListeners.current.set(id, callback);
        return () => messageListeners.current.delete(id);
    }, []);

    const subscribe = useCallback((table, live, maxLength) => {
        if (MOCKED_DATA[table]) {
            setTimeout(() => {
                messageListeners.current.forEach((callback) => {
                    callback({
                        type: 'historical',
                        table,
                        data: MOCKED_DATA[table].slice(-maxLength),
                    });
                });
            }, 500);
        }
    }, []);

    const unsubscribe = useCallback(() => {}, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const newData = {
                sensorDataBatch: {
                    stamp: now,
                    temperature: 25 + Math.sin(now / 10000) * 5 + Math.random(),
                    humidity: 45 + Math.cos(now / 10000) * 5 + Math.random(),
                },
                axisEstimates: {
                    stamp: now,
                    x_position: 10 + Math.sin(now / 5000) * 10,
                    y_position: 20 + Math.cos(now / 5000) * 10,
                },
            };
            messageListeners.current.forEach((callback) => {
                callback({
                    type: 'live',
                    table: 'sensorDataBatch',
                    data: [newData.sensorDataBatch],
                });
                callback({
                    type: 'live',
                    table: 'axisEstimates',
                    data: [newData.axisEstimates],
                });
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                isConnected,
                registerMessageListener,
                subscribe,
                unsubscribe,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);
    const showAlert = (message, type = 'info', duration = 3000) => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), duration);
    };

    const alertClasses = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alert && (
                <div
                    className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-xl text-white shadow-lg z-50 transition-all duration-300 ${alertClasses[alert.type]}`}
                >
                    {alert.message}
                </div>
            )}
        </AlertContext.Provider>
    );
};

const FirebaseProvider = ({ children }) => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestoreDb);
            setAuth(firebaseAuth);

            const unsubscribe = onAuthStateChanged(
                firebaseAuth,
                async (user) => {
                    if (user) {
                        setUserId(user.uid);
                        setIsAuthReady(true);
                    } else {
                        try {
                            if (initialAuthToken) {
                                await signInWithCustomToken(
                                    firebaseAuth,
                                    initialAuthToken
                                );
                            } else {
                                await signInAnonymously(firebaseAuth);
                            }
                        } catch (error) {
                            console.error('Firebase auth error:', error);
                            setIsAuthReady(true);
                        }
                    }
                }
            );

            return () => unsubscribe();
        } catch (error) {
            console.error('Firebase initialization failed:', error);
        }
    }, []);

    return (
        <FirebaseContext.Provider value={{ db, auth, userId, isAuthReady }}>
            {children}
        </FirebaseContext.Provider>
    );
};

const LoadingIndicator = ({ text }) => (
    <div className="flex flex-col items-center justify-center h-full">
        <SpinnerIcon className="animate-spin text-4xl text-gray-500 mb-4" />
        <p className="text-gray-500">{text}</p>
    </div>
);

// --- PLOT TRACE MANAGEMENT MODAL ---
const PlotModal = ({
    isOpen,
    onClose,
    plot,
    onUpdatePlot,
    availableTables,
    getAvailableColumns,
}) => {
    if (!isOpen || !plot) return null;
    const [nameInputValue, setNameInputValue] = useState(plot.name);
    const [lengthInputValue, setLengthInputValue] = useState(plot.max_length);
    const [traces, setTraces] = useState(plot.traces);

    const handleApplyChanges = () => {
        const updatedPlot = {
            ...plot,
            name: nameInputValue,
            max_length: Number(lengthInputValue),
            traces: traces,
        };
        onUpdatePlot(updatedPlot);
        onClose();
    };

    const handleAddTrace = (table, column) => {
        const newTrace = {
            table_name: table,
            column: column,
            color: '#8884d8',
        };
        if (
            !traces.some((t) => t.table_name === table && t.column === column)
        ) {
            setTraces([...traces, newTrace]);
        }
    };

    const handleRemoveTrace = (traceToRemove) => {
        setTraces(
            traces.filter(
                (trace) =>
                    !(
                        trace.table_name === traceToRemove.table_name &&
                        trace.column === traceToRemove.column
                    )
            )
        );
    };

    const handleUpdateTraceColor = (traceToUpdate, newColor) => {
        setTraces(
            traces.map((trace) => {
                if (
                    trace.table_name === traceToUpdate.table_name &&
                    trace.column === traceToUpdate.column
                ) {
                    return { ...trace, color: newColor };
                }
                return trace;
            })
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Edit Plot
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-800"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Plot Name Input */}
                <div className="mb-4">
                    <label
                        htmlFor="plotName"
                        className="font-semibold text-gray-700 mb-1 block"
                    >
                        Plot Name:
                    </label>
                    <input
                        id="plotName"
                        type="text"
                        value={nameInputValue}
                        onChange={(e) => setNameInputValue(e.target.value)}
                        placeholder="Enter plot name..."
                        className="w-full p-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <h4 className="font-semibold text-gray-700 mb-2">
                    Active Traces:
                </h4>
                <div className="flex flex-wrap gap-2 mb-6">
                    {traces.map((trace, traceIndex) => (
                        <div
                            key={traceIndex}
                            className="flex items-center gap-1 bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-xs"
                        >
                            {trace.table_name}:{trace.column}
                            <input
                                type="color"
                                value={trace.color || '#8884d8'}
                                onChange={(e) =>
                                    handleUpdateTraceColor(
                                        trace,
                                        e.target.value
                                    )
                                }
                                className="w-4 h-4 ml-1 rounded-full border-none cursor-pointer"
                            />
                            <button
                                onClick={() => handleRemoveTrace(trace)}
                                className="text-red-500 hover:text-red-700 ml-1"
                            >
                                <TrashIcon size={10} />
                            </button>
                        </div>
                    ))}
                    {traces.length === 0 && (
                        <span className="text-gray-500 text-sm italic">
                            No traces added yet.
                        </span>
                    )}
                </div>

                <div className="w-full mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">
                        Add New Trace:
                    </h4>
                    <select
                        onChange={(e) => {
                            const [table, column] = e.target.value.split(':');
                            if (table && column) {
                                handleAddTrace(table, column);
                                e.target.value = ''; // Reset select to prompt
                            }
                        }}
                        className="w-full p-2 rounded-md bg-white border border-gray-300 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                    >
                        <option value="" disabled>
                            Select a trace...
                        </option>
                        {availableTables.map((tableName) => (
                            <optgroup key={tableName} label={tableName}>
                                {getAvailableColumns(tableName).map(
                                    (columnName) => (
                                        <option
                                            key={`${tableName}:${columnName}`}
                                            value={`${tableName}:${columnName}`}
                                        >
                                            {columnName}
                                        </option>
                                    )
                                )}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <label
                        htmlFor={`maxLengthInput-${plot.id}`}
                        className="font-semibold text-gray-700 text-sm"
                    >
                        Chart Length:
                    </label>
                    <input
                        id={`maxLengthInput-${plot.id}`}
                        type="number"
                        value={lengthInputValue}
                        onChange={(e) =>
                            setLengthInputValue(Number(e.target.value))
                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleApplyChanges();
                        }}
                        className="w-24 p-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        min="1"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleApplyChanges}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- PLOT COMPONENT ---
const colors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00c49f',
    '#ffc658',
];

const PlotComponent = ({
    name,
    traces,
    max_length = 100,
    onEdit,
    onRemove,
}) => {
    const [chartData, setChartData] = useState({});
    const plotLength = useRef(max_length);

    const { registerMessageListener, subscribe, isConnected } =
        useContext(WebSocketContext);
    const { showAlert } = useContext(AlertContext);

    const uniqueTables = Array.from(new Set(traces.map((t) => t.table_name)));

    const websocketMessageCallback = useCallback(
        (message) => {
            try {
                if (!message || !message.data || !Array.isArray(message.data)) {
                    return;
                }

                const tracesToUpdate = traces.filter(
                    (t) => t.table_name === message.table
                );

                if (tracesToUpdate.length === 0) return;

                setChartData((prevData) => {
                    const updatedData = { ...prevData };
                    tracesToUpdate.forEach((trace) => {
                        const traceId = `${trace.table_name}-${trace.column}`;
                        const currentTraceData = updatedData[traceId] || [];

                        const parsedTraceData = message.data
                            .map((item) => ({
                                time: new Date(item.stamp).toLocaleTimeString(),
                                value: item[trace.column],
                            }))
                            .filter((point) => typeof point.value === 'number');

                        const newTraceData = [
                            ...currentTraceData,
                            ...parsedTraceData,
                        ];
                        const maxLengthToUse = plotLength.current;
                        updatedData[traceId] =
                            newTraceData.slice(-maxLengthToUse);
                    });
                    return updatedData;
                });
            } catch (error) {
                showAlert(
                    `Unvalidated websocket data: ${error.message}`,
                    'error'
                );
            }
        },
        [traces, showAlert]
    );

    useEffect(() => {
        if (!isConnected) return;

        const listenerId = traces
            .map((t) => `${t.table_name}-${t.column}`)
            .join(',');
        const unregisterListener = registerMessageListener(
            listenerId,
            websocketMessageCallback
        );

        uniqueTables.forEach((tableName) => {
            subscribe(tableName, true, max_length);
        });

        return () => {
            unregisterListener();
        };
    }, [
        isConnected,
        uniqueTables.join(','),
        max_length,
        websocketMessageCallback,
    ]);

    useEffect(() => {
        plotLength.current = max_length;
        setChartData((prevData) => {
            const updatedData = {};
            Object.entries(prevData).forEach(([key, value]) => {
                updatedData[key] = value.slice(-max_length);
            });
            return updatedData;
        });
    }, [max_length]);

    const hasData = Object.values(chartData).some((data) => data.length > 0);

    const mergedChartData = () => {
        const dataMap = new Map();
        Object.entries(chartData).forEach(([traceId, dataPoints]) => {
            dataPoints.forEach((point) => {
                const { time, value } = point;
                if (!dataMap.has(time)) {
                    dataMap.set(time, { time });
                }
                dataMap.get(time)[traceId] = value;
            });
        });
        return Array.from(dataMap.values());
    };

    const plotTitle = name || 'New Plot';

    return (
        <div className="flex flex-col rounded-2xl shadow-xl m-2 border border-gray-200 bg-white w-full h-[350px] p-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-800 truncate">
                    {plotTitle}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <SettingsIcon />
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <TrashIcon size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-grow w-full">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={mergedChartData()}
                            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                            />
                            <XAxis
                                dataKey="time"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            {traces.map((trace, index) => {
                                const traceId = `${trace.table_name}-${trace.column}`;
                                return (
                                    <Line
                                        key={traceId}
                                        type="monotone"
                                        dataKey={traceId}
                                        name={`${trace.table_name}:${trace.column}`}
                                        stroke={
                                            trace.color ||
                                            colors[index % colors.length]
                                        }
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 8 }}
                                        isAnimationActive={false}
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <LoadingIndicator text="Waiting for valid data..." />
                )}
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const [plots, setPlots] = useState([
        { id: uuidv4(), name: 'New Plot', traces: [], max_length: 100 },
    ]);
    const [editingPlotId, setEditingPlotId] = useState(null);

    const { db, userId, isAuthReady } = useContext(FirebaseContext);
    const { showAlert } = useContext(AlertContext);

    const availableTables = Object.keys(MOCKED_TABLE_SCHEMA_MAP);
    const getAvailableColumns = (tableName) => {
        const schema = MOCKED_TABLE_SCHEMA_MAP[tableName];
        return schema
            ? Object.keys(schema).filter((key) => key !== 'stamp')
            : [];
    };

    const handleAddPlot = () => {
        setPlots([
            ...plots,
            { id: uuidv4(), name: 'New Plot', traces: [], max_length: 100 },
        ]);
    };

    const handleRemovePlot = (id) => {
        setPlots(plots.filter((plot) => plot.id !== id));
    };

    const handleUpdatePlot = (updatedPlot) => {
        setPlots(
            plots.map((plot) =>
                plot.id === updatedPlot.id ? updatedPlot : plot
            )
        );
    };

    const savePlots = async () => {
        if (!isAuthReady || !userId) {
            showAlert('Please wait for authentication to complete.', 'error');
            return;
        }

        showAlert('Saving plots...', 'info');
        try {
            const plotsToSave = plots.map(
                ({ id, name, traces, max_length }) => ({
                    id,
                    name,
                    traces,
                    max_length,
                })
            );
            const userDocRef = doc(
                db,
                'artifacts',
                appId,
                'users',
                userId,
                'config',
                'plot_layout'
            );
            await setDoc(userDocRef, { plots: JSON.stringify(plotsToSave) });
            showAlert('Plots saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving plots: ', error);
            showAlert('Failed to save plots. Please try again.', 'error');
        }
    };

    const loadPlots = async () => {
        if (!isAuthReady || !userId) {
            showAlert('Please wait for authentication to complete.', 'error');
            return;
        }

        showAlert('Loading plots...', 'info');
        try {
            const userDocRef = doc(
                db,
                'artifacts',
                appId,
                'users',
                userId,
                'config',
                'plot_layout'
            );
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists() && docSnap.data().plots) {
                const loadedPlots = JSON.parse(docSnap.data().plots);
                if (Array.isArray(loadedPlots) && loadedPlots.length > 0) {
                    setPlots(loadedPlots);
                    showAlert('Plots loaded successfully!', 'success');
                } else {
                    showAlert('No saved plots found.', 'info');
                }
            } else {
                showAlert('No saved plots found.', 'info');
            }
        } catch (error) {
            console.error('Error loading plots: ', error);
            showAlert('Failed to load plots. Please try again.', 'error');
        }
    };

    const currentEditingPlot = plots.find((plot) => plot.id === editingPlotId);

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center font-sans">
            <div className="flex items-center justify-between w-full max-w-4xl mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Dynamic Plots
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={savePlots}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg shadow hover:bg-purple-700 transition-colors"
                    >
                        <SaveIcon /> Save Plots
                    </button>
                    <button
                        onClick={loadPlots}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 transition-colors"
                    >
                        <LoadIcon /> Load Plots
                    </button>
                    <button
                        onClick={handleAddPlot}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-colors"
                    >
                        <ChartLineIcon /> Add Plot
                    </button>
                </div>
            </div>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plots.map((plot) => (
                    <PlotComponent
                        key={plot.id}
                        name={plot.name}
                        traces={plot.traces}
                        max_length={plot.max_length}
                        onRemove={() => handleRemovePlot(plot.id)}
                        onEdit={() => setEditingPlotId(plot.id)}
                    />
                ))}
            </div>

            <PlotModal
                isOpen={!!editingPlotId}
                onClose={() => setEditingPlotId(null)}
                plot={currentEditingPlot}
                onUpdatePlot={handleUpdatePlot}
                availableTables={availableTables}
                getAvailableColumns={getAvailableColumns}
            />
        </div>
    );
};

export default function Root() {
    return (
        <WebSocketProvider>
            <AlertProvider>
                <FirebaseProvider>
                    <App />
                </FirebaseProvider>
            </AlertProvider>
        </WebSocketProvider>
    );
}
