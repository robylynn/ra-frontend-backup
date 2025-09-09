import React, { useEffect, useState } from 'react';

// For this single-file example, we will simulate a UUID generator
// In a real project, you would use a library like 'uuid'
// import { v4 as uuidv4 } from 'uuid';
const uuidv4 = () =>
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

// Icon components (simplified for this single file)
const PlusSquareIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V6a1 1 0 112 0v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3z"
            clipRule="evenodd"
            fillRule="evenodd"
        ></path>
    </svg>
);
const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-.41-1.01-.41-1.39 0L7.17 6.32a.5.5 0 01-.65.04L4.82 5.09a.5.5 0 00-.7.01L1.17 8.35a.5.5 0 00.32.85h3.18a.5.5 0 01.44.24l.64 1.13c.27.46.72.69 1.25.69h2.18c.53 0 .98-.23 1.25-.69l.64-1.13a.5.5 0 01.44-.24h3.18a.5.5 0 00.32-.85L15.28 5.1c-.13-.19-.3-.3-.49-.39L12.44 3.17c-.38-.41-1.01-.41-1.39 0zM10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 011-1h.01a1 1 0 11-.01 2H10a1 1 0 011-1zm1 3a1 1 0 00-1 1v.01a1 1 0 002 0V13a1 1 0 00-1-1zm0-6a1 1 0 011-1h.01a1 1 0 11-.01 2H10a1 1 0 011-1z"
            clipRule="evenodd"
        ></path>
    </svg>
);
const TrashIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-1 1v1H6a1 1 0 000 2v10a2 2 0 002 2h4a2 2 0 002-2V6a1 1 0 100-2h-2V3a1 1 0 00-1-1H9zM7 6h6v10a1 1 0 01-1 1H8a1 1 0 01-1-1V6z"
            clipRule="evenodd"
        ></path>
    </svg>
);
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
        ></path>
    </svg>
);
const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V4a1 1 0 011-1z"
            clipRule="evenodd"
        ></path>
    </svg>
);
const UploadIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M10 17a1 1 0 01-1-1v-8.586L6.707 9.707a1 1 0 11-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V16a1 1 0 01-1 1z"
            clipRule="evenodd"
        ></path>
    </svg>
);
const BellIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
    </svg>
);
const MagnifyingGlassIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
        ></path>
    </svg>
);
const ChevronRightIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
        ></path>
    </svg>
);

// A simple Tooltip component
const ToolTip = ({ children, text }) => (
    <div className="relative group">
        {children}
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded-lg whitespace-nowrap z-50">
            {text}
        </div>
    </div>
);

// Global State and Context (not used in this single file, but kept for future expansion)
const AppContext = React.createContext(null);

const ToolTipButton = ({ icon, text, onClick }) => (
    <ToolTip text={text}>
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-colors duration-200"
        >
            {icon}
            <span className="text-xs font-medium mt-1">{text}</span>
        </button>
    </ToolTip>
);

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100 opacity-100">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const SubscriptionGroupModal = ({ isOpen, onClose, group, onSave }) => {
    const [name, setName] = useState(group?.name || '');
    const [endpoint, setEndpoint] = useState(group?.endpoint || '');
    const [interval, setInterval] = useState(group?.interval || 100);

    useEffect(() => {
        setName(group?.name || '');
        setEndpoint(group?.endpoint || '');
        setInterval(group?.interval || 100);
    }, [group]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...group,
            name,
            endpoint,
            interval: Number(interval),
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                group ? 'Edit Subscription Group' : 'Add New Subscription Group'
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div className="flex flex-col">
                    <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-400"
                    >
                        Group Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label
                        htmlFor="endpoint"
                        className="text-sm font-medium text-gray-400"
                    >
                        Endpoint URL
                    </label>
                    <input
                        id="endpoint"
                        type="url"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        className="mt-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label
                        htmlFor="interval"
                        className="text-sm font-medium text-gray-400"
                    >
                        Publishing Interval (ms)
                    </label>
                    <input
                        id="interval"
                        type="number"
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        className="mt-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// --- NEW FEATURE: Server Discovery and Node Browsing ---
const mockNodeTree = {
    id: 'root',
    name: 'Objects',
    children: [
        {
            id: 'machines',
            name: 'Machines',
            children: [
                {
                    id: 'cnc',
                    name: 'CNC-01',
                    children: [
                        {
                            id: 'machine-status',
                            name: 'Status',
                            nodeId: 'ns=2;s=Machine.Status',
                        },
                        {
                            id: 'spindle-speed',
                            name: 'SpindleSpeed',
                            nodeId: 'ns=2;s=Machine.Spindle.Speed',
                        },
                        {
                            id: 'temperature',
                            name: 'Temperature',
                            nodeId: 'ns=2;s=Machine.Temp',
                        },
                    ],
                },
                {
                    id: 'robot',
                    name: 'Robot-02',
                    children: [
                        {
                            id: 'axis-1',
                            name: 'Axis1Position',
                            nodeId: 'ns=3;s=Robot.Axis1.Pos',
                        },
                        {
                            id: 'power-draw',
                            name: 'PowerDraw',
                            nodeId: 'ns=3;s=Robot.Power',
                        },
                    ],
                },
            ],
        },
        {
            id: 'sensors',
            name: 'Sensors',
            children: [
                {
                    id: 'pressure-sensor',
                    name: 'PressureSensor',
                    nodeId: 'ns=4;s=Pressure.Val',
                },
                {
                    id: 'level-sensor',
                    name: 'LevelSensor',
                    nodeId: 'ns=4;s=Tank.Level',
                },
            ],
        },
    ],
};

const NodeTree = ({ node, onNodeSelect }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (node.nodeId) {
        return (
            <div
                className="flex items-center justify-between py-2 pl-6 pr-2 text-sm text-gray-200 cursor-pointer hover:bg-gray-700 rounded-lg"
                onClick={() => onNodeSelect(node)}
            >
                <span>{node.name}</span>
                <PlusIcon className="w-4 h-4 text-green-400" />
            </div>
        );
    }

    return (
        <div>
            <div
                className="flex items-center space-x-2 py-2 cursor-pointer hover:bg-gray-700 rounded-lg px-2"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <ChevronRightIcon
                    className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
                <span>{node.name}</span>
            </div>
            <div
                className={`pl-4 transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
            >
                {node.children.map((child) => (
                    <NodeTree
                        key={child.id}
                        node={child}
                        onNodeSelect={onNodeSelect}
                    />
                ))}
            </div>
        </div>
    );
};

const ServerDiscoveryModal = ({ isOpen, onClose, onSelectNode, endpoint }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [nodeTree, setNodeTree] = useState(null);

    const handleConnect = async () => {
        setIsConnecting(true);
        setNodeTree(null);
        // Simulate API call to OPC-UA server
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setNodeTree(mockNodeTree);
        setIsConnecting(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="OPC-UA Server Browser">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="opc.tcp://localhost:4840"
                        defaultValue={endpoint}
                        disabled
                    />
                    <button
                        onClick={handleConnect}
                        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={isConnecting}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect'}
                    </button>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 h-[50vh] overflow-y-auto">
                    {isConnecting && (
                        <div className="text-center text-gray-400">
                            Connecting to server...
                        </div>
                    )}
                    {nodeTree && (
                        <NodeTree node={nodeTree} onNodeSelect={onSelectNode} />
                    )}
                    {!isConnecting && !nodeTree && (
                        <div className="text-center text-gray-400">
                            Enter a valid endpoint URL and click "Connect".
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

// --- NEW FEATURE: Alarms and Events Configuration ---
const AlarmModal = ({ isOpen, onClose, alarm, dataPoint, onSave }) => {
    const [condition, setCondition] = useState(alarm?.condition || '>');
    const [value, setValue] = useState(alarm?.value || '');
    const [severity, setSeverity] = useState(alarm?.severity || 'High');

    useEffect(() => {
        setCondition(alarm?.condition || '>');
        setValue(alarm?.value || '');
        setSeverity(alarm?.severity || 'High');
    }, [alarm]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            id: alarm?.id || uuidv4(),
            dataPointId: dataPoint.id,
            condition,
            value: Number(value),
            severity,
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Configure Alarm for "${dataPoint?.name}"`}
        >
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                    <label
                        htmlFor="condition"
                        className="text-sm font-medium text-gray-400"
                    >
                        Condition
                    </label>
                    <select
                        id="condition"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value=">">Greater Than</option>
                        <option value="<">Less Than</option>
                        <option value="==">Equals</option>
                        <option value="!=">Not Equals</option>
                    </select>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Value"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label
                        htmlFor="severity"
                        className="text-sm font-medium text-gray-400"
                    >
                        Severity
                    </label>
                    <select
                        id="severity"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="mt-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Save Alarm
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const DataPoint = ({
    dataPoint,
    onOpenAlarmModal,
    onDelete,
    currentValue,
    isAlarmConfigured,
}) => (
    <div className="bg-gray-700 p-3 rounded-xl flex items-center justify-between shadow-inner hover:bg-gray-600 transition-colors">
        <div className="flex items-center space-x-4 flex-grow truncate">
            <div className="flex-shrink-0">
                {isAlarmConfigured ? (
                    <span className="bg-red-500 w-3 h-3 block rounded-full"></span>
                ) : (
                    <span className="bg-green-500 w-3 h-3 block rounded-full"></span>
                )}
            </div>
            <div className="flex flex-col truncate">
                <div className="text-sm font-bold text-gray-200 truncate">
                    {dataPoint.name}
                </div>
                <div className="text-xs font-semibold text-gray-400 truncate">
                    {dataPoint.nodeId}
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="text-xs font-semibold text-gray-400">Value:</div>
            <div className="text-lg font-bold text-green-400">
                {currentValue.toFixed(2)}
            </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <button
                onClick={() => onOpenAlarmModal(dataPoint)}
                className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full"
            >
                <BellIcon />
            </button>
            <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full"
            >
                <TrashIcon />
            </button>
        </div>
    </div>
);

const SubscriptionGroup = ({
    group,
    onEdit,
    onDelete,
    onAddDataPoint,
    onEditDataPoint,
    onDeleteDataPoint,
    alarms,
    onOpenAlarmModal,
    liveValues,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden mb-6">
            <div
                className="flex justify-between items-center p-6 border-b border-gray-700 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-lg font-semibold text-white truncate">
                    {group.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{group.endpoint}</span>
                    <span>Interval: {group.interval}ms</span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddDataPoint(group.id, group.endpoint);
                            }}
                            className="p-2 text-green-400 hover:text-white rounded-full transition-colors"
                        >
                            <PlusIcon />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(group);
                            }}
                            className="p-2 text-blue-400 hover:text-white rounded-full transition-colors"
                        >
                            <SettingsIcon />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(group.id);
                            }}
                            className="p-2 text-red-400 hover:text-white rounded-full transition-colors"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </div>
            </div>
            <div
                className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-6 space-y-4">
                    {group.dataPoints.length > 0 ? (
                        group.dataPoints.map((dp) => (
                            <DataPoint
                                key={dp.id}
                                dataPoint={dp}
                                onOpenAlarmModal={onOpenAlarmModal}
                                onDelete={() =>
                                    onDeleteDataPoint(group.id, dp.id)
                                }
                                currentValue={liveValues[dp.id] || 0}
                                isAlarmConfigured={alarms.some(
                                    (a) => a.dataPointId === dp.id
                                )}
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-4">
                            No data points configured.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [subscriptionGroups, setSubscriptionGroups] = useState([]);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isServerDiscoveryOpen, setIsServerDiscoveryOpen] = useState(false);
    const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);

    const [editingGroup, setEditingGroup] = useState(null);
    const [parentGroupId, setParentGroupId] = useState(null);
    const [browsingEndpoint, setBrowsingEndpoint] = useState('');

    const [editingAlarm, setEditingAlarm] = useState(null);
    const [editingDataPointForAlarm, setEditingDataPointForAlarm] =
        useState(null);

    const [liveValues, setLiveValues] = useState({});
    const [alarms, setAlarms] = useState([]);

    // Simulate real-time OPC-UA data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveValues((prevValues) => {
                const newValues = {};
                subscriptionGroups.forEach((group) => {
                    group.dataPoints.forEach((dp) => {
                        // Generate a slightly new value based on the previous one
                        const prevValue = prevValues[dp.id] || 100;
                        const newValue = prevValue + (Math.random() - 0.5) * 5;
                        newValues[dp.id] = Math.max(0, newValue);
                    });
                });

                // --- Simulated Alarm Logic ---
                alarms.forEach((alarm) => {
                    const currentValue = newValues[alarm.dataPointId];
                    let isTriggered = false;
                    // Fixed: Replaced insecure eval() with a safe switch statement
                    switch (alarm.condition) {
                        case '>':
                            isTriggered = currentValue > alarm.value;
                            break;
                        case '<':
                            isTriggered = currentValue < alarm.value;
                            break;
                        case '==':
                            isTriggered = currentValue === alarm.value;
                            break;
                        case '!=':
                            isTriggered = currentValue !== alarm.value;
                            break;
                    }

                    if (isTriggered) {
                        console.log(
                            `ALARM TRIGGERED: ${alarm.dataPointId} is ${alarm.condition} ${alarm.value} (Severity: ${alarm.severity})`
                        );
                    }
                });

                return newValues;
            });
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [subscriptionGroups, alarms]);

    const handleAddGroup = () => {
        setEditingGroup(null);
        setIsGroupModalOpen(true);
    };

    const handleSaveGroup = (groupData) => {
        if (groupData.id) {
            // Edit existing group
            setSubscriptionGroups((groups) =>
                groups.map((g) => (g.id === groupData.id ? groupData : g))
            );
        } else {
            // Add new group
            setSubscriptionGroups((groups) => [
                ...groups,
                { ...groupData, id: uuidv4(), dataPoints: [] },
            ]);
        }
    };

    const handleDeleteGroup = (groupId) => {
        setSubscriptionGroups((groups) =>
            groups.filter((g) => g.id !== groupId)
        );
    };

    const handleOpenServerDiscovery = (groupId, endpoint) => {
        setParentGroupId(groupId);
        setBrowsingEndpoint(endpoint);
        setIsServerDiscoveryOpen(true);
    };

    const handleSelectNodeFromDiscovery = (node) => {
        const groupId = parentGroupId;
        if (groupId) {
            setSubscriptionGroups((groups) =>
                groups.map((group) => {
                    if (group.id === groupId) {
                        return {
                            ...group,
                            dataPoints: [
                                ...group.dataPoints,
                                {
                                    id: uuidv4(),
                                    name: node.name,
                                    nodeId: node.nodeId,
                                },
                            ],
                        };
                    }
                    return group;
                })
            );
        }
        setIsServerDiscoveryOpen(false);
    };

    const handleDeleteDataPoint = (groupId, dataPointId) => {
        setSubscriptionGroups((groups) =>
            groups.map((group) =>
                group.id === groupId
                    ? {
                          ...group,
                          dataPoints: group.dataPoints.filter(
                              (dp) => dp.id !== dataPointId
                          ),
                      }
                    : group
            )
        );
        // Also remove any associated alarms
        setAlarms(alarms.filter((a) => a.dataPointId !== dataPointId));
    };

    const handleSaveAlarm = (alarmData) => {
        setAlarms((currentAlarms) => {
            const existingAlarmIndex = currentAlarms.findIndex(
                (a) => a.id === alarmData.id
            );
            if (existingAlarmIndex !== -1) {
                const newAlarms = [...currentAlarms];
                newAlarms[existingAlarmIndex] = alarmData;
                return newAlarms;
            } else {
                return [...currentAlarms, alarmData];
            }
        });
    };

    const handleOpenAlarmModal = (dataPoint) => {
        setEditingDataPointForAlarm(dataPoint);
        const existingAlarm = alarms.find(
            (a) => a.dataPointId === dataPoint.id
        );
        setEditingAlarm(existingAlarm);
        setIsAlarmModalOpen(true);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center">
            <div className="w-full max-w-7xl mx-auto p-8">
                {/* Header and Global Actions */}
                <div className="flex items-center justify-between pb-8">
                    <h1 className="text-3xl font-extrabold text-blue-400">
                        OPC-UA Configuration
                    </h1>
                    <div className="flex items-center space-x-4">
                        <ToolTipButton
                            icon={<PlusSquareIcon />}
                            text="Add Group"
                            onClick={handleAddGroup}
                        />
                        <ToolTipButton
                            icon={<DownloadIcon />}
                            text="Export"
                            onClick={() =>
                                console.log('Exporting configuration...')
                            }
                        />
                        <ToolTipButton
                            icon={<UploadIcon />}
                            text="Import"
                            onClick={() =>
                                console.log('Importing configuration...')
                            }
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-gray-900 min-h-full">
                    {subscriptionGroups.length > 0 ? (
                        subscriptionGroups.map((group) => (
                            <SubscriptionGroup
                                key={group.id}
                                group={group}
                                onEdit={setEditingGroup}
                                onDelete={handleDeleteGroup}
                                onAddDataPoint={handleOpenServerDiscovery}
                                onDeleteDataPoint={handleDeleteDataPoint}
                                liveValues={liveValues}
                                alarms={alarms}
                                onOpenAlarmModal={handleOpenAlarmModal}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
                            <p className="text-lg">
                                No subscription groups configured.
                            </p>
                            <button
                                onClick={handleAddGroup}
                                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                <PlusIcon />
                                <span>Add First Group</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <SubscriptionGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                group={editingGroup}
                onSave={handleSaveGroup}
            />
            <ServerDiscoveryModal
                isOpen={isServerDiscoveryOpen}
                onClose={() => setIsServerDiscoveryOpen(false)}
                onSelectNode={handleSelectNodeFromDiscovery}
                endpoint={browsingEndpoint}
            />
            <AlarmModal
                isOpen={isAlarmModalOpen}
                onClose={() => setIsAlarmModalOpen(false)}
                alarm={editingAlarm}
                dataPoint={editingDataPointForAlarm}
                onSave={handleSaveAlarm}
            />
        </div>
    );
}
