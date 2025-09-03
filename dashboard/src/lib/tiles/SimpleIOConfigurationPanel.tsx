import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCustomToken,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

// --- GLOBAL VARIABLES & FIREBASE CONFIG ---
const firebaseConfig =
    typeof __firebase_config !== 'undefined'
        ? JSON.parse(__firebase_config)
        : {};
const initialAuthToken =
    typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- INLINE SVG ICONS (Lucide) ---
const PlusIcon = () => (
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
        className="lucide lucide-plus"
    >
        <line x1="12" x2="12" y1="5" y2="19" />
        <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
);
const TrashIcon = () => (
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
        className="lucide lucide-trash-2"
    >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
);
const GripVerticalIcon = () => (
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
        className="lucide lucide-grip-vertical"
    >
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="19" r="1" />
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
const CloudDownloadIcon = () => (
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
        className="lucide lucide-cloud-download"
    >
        <path d="M4 14.5V14a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v.5" />
        <path d="M12 10V20" />
        <path d="m15 17-3 3-3-3" />
        <path d="M20 16.5A5 5 0 0 0 18 7h-1.5a4 4 0 0 0-8-.5 4 4 0 0 0-4 4" />
    </svg>
);
const UploadIcon = () => (
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
        className="lucide lucide-upload"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
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
        className="lucide lucide-loader-2 animate-spin"
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);
const CloudIcon = () => (
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
        className="lucide lucide-cloud"
    >
        <path d="M4 14.5a5 5 0 0 1 1.5-9.4M17 14.5a5 5 0 0 1 1.5-9.4M10 14a6 6 0 0 1 6-6h1a4 4 0 0 1 4 4v2.5M10 14a6 6 0 0 0 6 6h1a4 4 0 0 0 4-4v-2.5M10 14a6 6 0 0 1-6-6h-1a4 4 0 0 1-4 4v2.5" />
    </svg>
);
const ServerIcon = () => (
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
        className="lucide lucide-server-cog"
    >
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
        <path d="M6 6h.01" />
        <path d="M6 18h.01" />
        <path d="M13 18h.01" />
        <path d="M16 18h.01" />
        <path d="M19 18h.01" />
    </svg>
);
const InputIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-arrow-down-to-dot"
    >
        <path d="M12 2v14" />
        <path d="m15 13-3 3-3-3" />
        <circle cx="12" cy="21" r="1" />
    </svg>
);
const OutputIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-arrow-up-to-dot"
    >
        <path d="M12 16V2" />
        <path d="m15 5-3-3-3 3" />
        <circle cx="12" cy="21" r="1" />
    </svg>
);
const SignalIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-signal"
    >
        <path d="M2 20h.01" />
        <path d="M7 20h.01" />
        <path d="M12 20h.01" />
        <path d="M17 20h.01" />
        <path d="M22 20h.01" />
    </svg>
);

// --- CONTEXTS ---
const FirebaseContext = createContext(null);
const AlertContext = createContext(null);

// --- FIREBASE PROVIDER ---
const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
    const [db, setDb] = useState<any>(null);
    const [auth, setAuth] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);
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
                        }
                    }
                    setIsAuthReady(true);
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

// --- ALERT PROVIDER (CUSTOM MESSAGE BOX) ---
const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [alert, setAlert] = useState<{
        message: string;
        type: string;
    } | null>(null);
    const showAlert = (
        message: string,
        type: string = 'info',
        duration: number = 3000
    ) => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), duration);
    };
    const alertClasses: { [key: string]: string } = {
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

// --- TYPESCRIPT INTERFACES ---
interface IOPoint {
    id: string;
    label: string;
    type: 'DI' | 'DO' | 'AI' | 'AO';
    value: boolean | number;
}
interface ModuleType {
    name: string;
    icon: string;
    points: Omit<IOPoint, 'id' | 'value'>[];
}
interface Module {
    id: string;
    name: string;
    type: ModuleType;
    points: IOPoint[];
}
interface RackConfig {
    name: string;
    address: string;
    maxModules: number;
}

// --- PREDEFINED MODULE TYPES ---
const moduleTypes: ModuleType[] = [
    {
        name: '4-Slot DIO',
        icon: 'DigitalIOIcon',
        points: [
            { label: 'DI-1', type: 'DI' },
            { label: 'DI-2', type: 'DI' },
            { label: 'DO-1', type: 'DO' },
            { label: 'DO-2', type: 'DO' },
        ],
    },
    {
        name: '8-Slot DI',
        icon: 'DigitalInIcon',
        points: [
            { label: 'DI-1', type: 'DI' },
            { label: 'DI-2', type: 'DI' },
            { label: 'DI-3', type: 'DI' },
            { label: 'DI-4', type: 'DI' },
            { label: 'DI-5', type: 'DI' },
            { label: 'DI-6', type: 'DI' },
            { label: 'DI-7', type: 'DI' },
            { label: 'DI-8', type: 'DI' },
        ],
    },
    {
        name: '4-Slot AIO',
        icon: 'AnalogIOIcon',
        points: [
            { label: 'AI-1', type: 'AI' },
            { label: 'AI-2', type: 'AI' },
            { label: 'AO-1', type: 'AO' },
            { label: 'AO-2', type: 'AO' },
        ],
    },
    {
        name: '2-Slot AI',
        icon: 'AnalogInIcon',
        points: [
            { label: 'AI-1', type: 'AI' },
            { label: 'AI-2', type: 'AI' },
        ],
    },
];

// --- IO POINT COMPONENT (within Modal) ---
interface IOPointProps {
    point: IOPoint;
    onUpdateValue: (id: string, value: any) => void;
}
const IOPointComponent: React.FC<IOPointProps> = ({ point, onUpdateValue }) => {
    const isDigital = point.type.startsWith('D');
    const isInput = point.type.endsWith('I');
    const handleDigitalToggle = () => onUpdateValue(point.id, !point.value);
    const handleAnalogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? '' : Number(e.target.value);
        if (value !== '' && isNaN(value)) return;
        onUpdateValue(point.id, value);
    };
    return (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 rounded-lg min-h-[48px]">
            <div className="flex items-center gap-2">
                <span
                    className={`p-1 rounded-full ${isDigital ? 'bg-blue-200 text-blue-800' : 'bg-purple-200 text-purple-800'}`}
                >
                    {isDigital ? (
                        isInput ? (
                            <InputIcon />
                        ) : (
                            <OutputIcon />
                        )
                    ) : (
                        <SignalIcon />
                    )}
                </span>
                <span className="text-sm font-medium text-gray-700 truncate">
                    {point.label}
                </span>
            </div>
            {isDigital ? (
                <button
                    onClick={isInput ? undefined : handleDigitalToggle}
                    className={`h-6 w-12 rounded-full p-0.5 transition-colors duration-200 relative flex items-center justify-center ${isInput ? 'bg-gray-200 cursor-not-allowed' : point.value ? 'bg-green-500' : 'bg-gray-400'}`}
                    disabled={isInput}
                >
                    <div
                        className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${point.value ? 'translate-x-3' : '-translate-x-3'}`}
                    ></div>
                </button>
            ) : (
                <div className="flex items-center gap-1 w-full">
                    <input
                        type="number"
                        value={point.value as number}
                        onChange={handleAnalogChange}
                        disabled={isInput}
                        min={-100}
                        max={100}
                        step={0.1}
                        className={`w-16 p-1 text-sm rounded-md text-center border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isInput ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800 border-gray-300'}`}
                    />
                </div>
            )}
        </div>
    );
};

// --- MODULE CONFIGURATION MODAL ---
interface ModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    module: Module | null;
    onSave: (updatedModule: Module) => void;
}
const ModuleModal: React.FC<ModuleModalProps> = ({
    isOpen,
    onClose,
    module,
    onSave,
}) => {
    if (!isOpen || !module) return null;
    const [formData, setFormData] = useState(module);
    useEffect(() => {
        setFormData(module);
    }, [module]);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTypeName = e.target.value;
        const newType = moduleTypes.find((t) => t.name === selectedTypeName);
        if (newType) {
            setFormData((prev) => ({
                ...prev,
                type: newType,
                points: newType.points.map((p) => ({
                    ...p,
                    id: uuidv4(),
                    value:
                        p.type === 'DO' ? false : p.type === 'AO' ? 0 : false,
                })),
            }));
        }
    };
    const handleUpdatePointValue = (pointId: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            points: prev.points.map((p) =>
                p.id === pointId ? { ...p, value: value } : p
            ),
        }));
    };
    const handleSave = () => {
        onSave(formData);
        onClose();
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Configure Module
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
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                >
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">
                            Module Name:
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">
                            Module Type:
                        </label>
                        <select
                            value={formData.type.name}
                            onChange={handleTypeChange}
                            className="w-full p-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {moduleTypes.map((type) => (
                                <option key={type.name} value={type.name}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mt-6 mb-2">
                        I/O Points
                    </h4>
                    <div className="space-y-2">
                        {formData.points.map((point) => (
                            <IOPointComponent
                                key={point.id}
                                point={point}
                                onUpdateValue={handleUpdatePointValue}
                            />
                        ))}
                    </div>
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- RACK CONFIGURATION MODAL ---
interface RackModalProps {
    isOpen: boolean;
    onClose: () => void;
    rack: RackConfig;
    onSave: (updatedRack: RackConfig) => void;
}
const RackModal: React.FC<RackModalProps> = ({
    isOpen,
    onClose,
    rack,
    onSave,
}) => {
    if (!isOpen) return null;
    const [formData, setFormData] = useState(rack);
    useEffect(() => {
        setFormData(rack);
    }, [rack]);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'maxModules' ? parseInt(value) || 0 : value,
        }));
    };
    const handleSave = () => {
        onSave(formData);
        onClose();
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Configure Rack
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
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                >
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">
                            Rack Name:
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">
                            Address:
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">
                            Max Modules:
                        </label>
                        <input
                            type="number"
                            name="maxModules"
                            value={formData.maxModules}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full p-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MODULE COMPONENT (on backplane) ---
interface ModuleProps {
    module: Module;
    index: number;
    onRemove: (id: string) => void;
    onEdit: (id: string) => void;
    onDragStart: (e: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
}
const ModuleComponent: React.FC<ModuleProps> = ({
    module,
    index,
    onRemove,
    onEdit,
    onDragStart,
    onDragEnd,
}) => {
    return (
        <div
            className="flex-shrink-0 w-[240px] h-[400px] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 p-4 relative cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragEnd={onDragEnd}
        >
            <div className="absolute top-2 left-2 text-xl font-mono font-bold text-gray-400">
                {index + 1}
            </div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-gray-800 truncate">
                    {module.name}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(module.id)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                        <SettingsIcon />
                    </button>
                    <button
                        onClick={() => onRemove(module.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <TrashIcon />
                    </button>
                    <div className="p-1 text-gray-400 cursor-grab">
                        <GripVerticalIcon />
                    </div>
                </div>
            </div>
            <div className="text-sm text-gray-500 mb-4">{module.type.name}</div>
            <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                {module.points.map((point) => (
                    <div
                        key={point.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 rounded-lg min-h-[48px]"
                    >
                        <span className="text-sm font-medium text-gray-700 truncate">
                            {point.label}
                        </span>
                        <span className="text-sm font-mono text-gray-600">
                            {point.type.startsWith('D')
                                ? point.value
                                    ? 'ON'
                                    : 'OFF'
                                : `${point.value}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const IOConfigurationPanel: React.FC = () => {
    const [modules, setModules] = useState<Module[]>([]);
    const [rackConfig, setRackConfig] = useState<RackConfig>({
        name: 'Main PLC',
        address: '192.168.1.100',
        maxModules: 8,
    });
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [isRackModalOpen, setIsRackModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { db, userId, isAuthReady } = useContext(FirebaseContext);
    const { showAlert } = useContext(AlertContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag and Drop State
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // Module CRUD operations
    const handleAddModule = () => {
        if (modules.length >= rackConfig.maxModules) {
            showAlert(
                `Cannot add more than ${rackConfig.maxModules} modules.`,
                'error'
            );
            return;
        }
        const defaultType = moduleTypes[0];
        const newModule: Module = {
            id: uuidv4(),
            name: `Module_${modules.length + 1}`,
            type: defaultType,
            points: defaultType.points.map((p) => ({
                ...p,
                id: uuidv4(),
                value: p.type === 'DO' ? false : p.type === 'AO' ? 0 : false,
            })),
        };
        setModules((prev) => [...prev, newModule]);
    };
    const handleRemoveModule = (id: string) =>
        setModules((prev) => prev.filter((mod) => mod.id !== id));
    const handleEditModule = (id: string) => setEditingModuleId(id);
    const handleSaveModule = (updatedModule: Module) => {
        setModules((prev) =>
            prev.map((mod) =>
                mod.id === updatedModule.id ? updatedModule : mod
            )
        );
        setEditingModuleId(null);
    };

    // Firebase Save & Load
    const saveConfigToCloud = async () => {
        if (!isAuthReady || !userId) {
            showAlert('Authentication in progress. Please wait.', 'error');
            return;
        }
        setIsSaving(true);
        showAlert('Saving configuration...', 'info');
        try {
            const userDocRef = doc(
                db,
                'artifacts',
                appId,
                'users',
                userId,
                'config',
                'plc_config'
            );
            await setDoc(userDocRef, {
                modules: JSON.stringify(modules),
                rack: JSON.stringify(rackConfig),
            });
            showAlert('Configuration saved to the cloud!', 'success');
        } catch (error) {
            console.error('Error saving config:', error);
            showAlert('Failed to save configuration.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    const loadConfigFromCloud = async () => {
        if (!isAuthReady || !userId) {
            showAlert('Authentication in progress. Please wait.', 'error');
            return;
        }
        setIsLoading(true);
        showAlert('Loading configuration...', 'info');
        try {
            const userDocRef = doc(
                db,
                'artifacts',
                appId,
                'users',
                userId,
                'config',
                'plc_config'
            );
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.modules) setModules(JSON.parse(data.modules));
                if (data.rack) setRackConfig(JSON.parse(data.rack));
                showAlert('Configuration loaded from the cloud!', 'success');
            } else {
                showAlert('No saved configuration found.', 'info');
            }
        } catch (error) {
            console.error('Error loading config:', error);
            showAlert('Failed to load configuration.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Export & Import
    const exportConfig = () => {
        const configJson = JSON.stringify(
            { modules, rack: rackConfig },
            null,
            2
        );
        const blob = new Blob([configJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'plc_config.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showAlert('Configuration exported as JSON!', 'success');
    };
    const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            showAlert('No file selected.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target?.result as string);
                if (
                    importedData.modules &&
                    Array.isArray(importedData.modules)
                ) {
                    setModules(importedData.modules);
                    if (importedData.rack) setRackConfig(importedData.rack);
                    showAlert(
                        'Configuration imported successfully!',
                        'success'
                    );
                } else {
                    throw new Error('Invalid file format.');
                }
            } catch (error: any) {
                showAlert(`Failed to import config: ${error.message}`, 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) =>
        (dragItem.current = index);
    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        dragOverItem.current = index;
    };
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = () => {
        if (
            dragItem.current === null ||
            dragOverItem.current === null ||
            dragItem.current === dragOverItem.current
        )
            return;
        const newModules = [...modules];
        const [reorderedItem] = newModules.splice(dragItem.current, 1);
        newModules.splice(dragOverItem.current, 0, reorderedItem);
        setModules(newModules);
    };
    const handleDragEnd = () => {
        dragItem.current = null;
        dragOverItem.current = null;
    };
    const editingModule = modules.find((m) => m.id === editingModuleId) || null;

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center font-sans">
            <div className="w-full max-w-7xl flex flex-col items-center mb-6">
                <div className="flex items-center justify-between w-full mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            PLC Configurator
                        </h1>
                        <button
                            onClick={() => setIsRackModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-bold rounded-lg shadow hover:bg-gray-700 transition-colors"
                        >
                            <ServerIcon /> Configure Rack
                        </button>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={saveConfigToCloud}
                            disabled={isSaving || isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg shadow hover:bg-purple-700 transition-colors"
                        >
                            {isSaving ? <SpinnerIcon /> : <CloudIcon />} Save
                        </button>
                        <button
                            onClick={loadConfigFromCloud}
                            disabled={isSaving || isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 transition-colors"
                        >
                            {isLoading ? (
                                <SpinnerIcon />
                            ) : (
                                <CloudDownloadIcon />
                            )}{' '}
                            Load
                        </button>
                        <button
                            onClick={exportConfig}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-bold rounded-lg shadow hover:bg-teal-700 transition-colors"
                        >
                            <SaveIcon /> Export
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-bold rounded-lg shadow hover:bg-orange-700 transition-colors"
                        >
                            <UploadIcon /> Import
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={importConfig}
                            className="hidden"
                            accept=".json"
                        />
                        <button
                            onClick={handleAddModule}
                            disabled={modules.length >= rackConfig.maxModules}
                            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg shadow transition-colors ${modules.length >= rackConfig.maxModules ? 'bg-blue-300 text-gray-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            <PlusIcon /> Add Module
                        </button>
                    </div>
                </div>
                <div className="w-full text-center text-gray-600 font-semibold text-lg">
                    {rackConfig.name} | Address: {rackConfig.address} | Max
                    Slots: {rackConfig.maxModules}
                </div>
            </div>

            <div className="w-full max-w-7xl overflow-x-auto p-4 bg-gray-200 rounded-xl shadow-inner">
                <div
                    className="flex items-start gap-4 min-w-max"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {modules.map((module, index) => (
                        <div
                            key={module.id}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                        >
                            <ModuleComponent
                                module={module}
                                index={index}
                                onRemove={handleRemoveModule}
                                onEdit={handleEditModule}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            />
                        </div>
                    ))}
                    {modules.length === 0 && (
                        <div className="p-8 text-center text-gray-500 italic flex-grow">
                            Your PLC backplane is empty. Click "Add Module" to
                            get started.
                        </div>
                    )}
                </div>
            </div>

            <ModuleModal
                isOpen={!!editingModule}
                onClose={() => setEditingModuleId(null)}
                module={editingModule}
                onSave={handleSaveModule}
            />
            <RackModal
                isOpen={isRackModalOpen}
                onClose={() => setIsRackModalOpen(false)}
                rack={rackConfig}
                onSave={setRackConfig}
            />
        </div>
    );
};

export default function Root() {
    return (
        <FirebaseProvider>
            <AlertProvider>
                <App />
            </AlertProvider>
        </FirebaseProvider>
    );
}
