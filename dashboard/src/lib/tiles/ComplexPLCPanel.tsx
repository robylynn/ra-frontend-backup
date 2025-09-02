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
        className="lucide lucude-upload"
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
const PlusSquareIcon = () => (
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
        className="lucide lucide-plus-square"
    >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
    </svg>
);

// --- ZOD LOADER COMPONENT ---
const ZodLoader = ({ children }: { children: React.ReactNode }) => {
    const [isZodLoaded, setIsZodLoaded] = useState(false);
    useEffect(() => {
        if (window.z) {
            setIsZodLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/zod@3.22.4/lib/index.umd.js';
        script.onload = () => {
            setIsZodLoaded(true);
        };
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        };
    }, []);
    if (!isZodLoaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <SpinnerIcon />
                <p className="mt-4 text-gray-600">
                    Loading PLC Configurator...
                </p>
            </div>
        );
    }
    return <>{children}</>;
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const z = window.z;
    // --- ZOD SCHEMAS ---
    const IOPointSchema = z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(['DI', 'DO', 'AI', 'AO']),
        value: z.union([z.boolean(), z.number()]),
    });

    const ModuleTypeSchema = z.object({
        name: z.string(),
        icon: z.string(),
        points: z.array(
            z.object({
                label: z.string(),
                type: z.enum(['DI', 'DO', 'AI', 'AO']),
            })
        ),
    });

    const ModuleSchema = z.object({
        id: z.string(),
        name: z.string(),
        type: ModuleTypeSchema,
        points: z.array(IOPointSchema),
    });

    const RackConfigSchema = z.object({
        name: z.string(),
        address: z.string(),
        maxModules: z.number().int().min(1),
    });

    const RackSchema = z.object({
        id: z.string(),
        modules: z.array(ModuleSchema),
        rackConfig: RackConfigSchema,
    });

    const ConfigurationSchema = z.array(RackSchema);
    // --- END ZOD SCHEMAS ---

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
    interface Rack {
        id: string;
        modules: Module[];
        rackConfig: RackConfig;
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
        {
            name: 'Temperature',
            icon: 'TempIcon',
            points: [
                { label: 'Temp-1', type: 'AI' },
                { label: 'Temp-2', type: 'AI' },
            ],
        },
        {
            name: 'H.S. Counter',
            icon: 'CounterIcon',
            points: [
                { label: 'Count-A', type: 'DI' },
                { label: 'Count-B', type: 'DI' },
            ],
        },
    ];

    // --- IO POINT COMPONENT (within Modal) ---
    interface IOPointProps {
        point: IOPoint;
        onUpdateValue: (id: string, value: any) => void;
    }
    const IOPointComponent: React.FC<IOPointProps> = ({
        point,
        onUpdateValue,
    }) => {
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
            const newType = moduleTypes.find(
                (t) => t.name === selectedTypeName
            );
            if (newType) {
                setFormData((prev) => ({
                    ...prev,
                    type: newType,
                    points: newType.points.map((p) => ({
                        ...p,
                        id: uuidv4(),
                        value:
                            p.type === 'DO'
                                ? false
                                : p.type === 'AO'
                                  ? 0
                                  : false,
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
        rack: Rack | null;
        onSave: (updatedRack: Rack) => void;
        onDelete: () => void;
    }
    const RackModal: React.FC<RackModalProps> = ({
        isOpen,
        onClose,
        rack,
        onSave,
        onDelete,
    }) => {
        if (!isOpen || !rack) return null;
        const [formData, setFormData] = useState(rack);
        useEffect(() => {
            setFormData(rack);
        }, [rack]);
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                rackConfig: {
                    ...prev.rackConfig,
                    [name]:
                        name === 'maxModules' ? parseInt(value) || 0 : value,
                },
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
                                value={formData.rackConfig.name}
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
                                value={formData.rackConfig.address}
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
                                value={formData.rackConfig.maxModules}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full p-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                onClick={onDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                            >
                                Delete Rack
                            </button>
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
        onDragStart: (e: React.DragEvent, item: any) => void;
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
                onDragStart={(e) => onDragStart(e, { moduleIndex: index })}
                onDragEnd={onDragEnd}
            >
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
                <div className="text-sm text-gray-500 mb-4 font-mono">
                    Slot {index + 1}: {module.type.name}
                </div>
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

    // --- RACK COMPONENT CONTAINER ---
    interface RackComponentProps {
        rack: Rack;
        onAddModule: (rackId: string) => void;
        onDeleteRack: (rackId: string) => void;
        onEditRack: (rack: Rack) => void;
        onRemoveModule: (rackId: string, moduleId: string) => void;
        onEditModule: (rackId: string, moduleId: string) => void;
        onSaveModule: (rackId: string, updatedModule: Module) => void;
        dragItem: React.MutableRefObject<any>;
        dragOverItem: React.MutableRefObject<any>;
        handleDragStart: (e: React.DragEvent, item: any) => void;
        handleDragEnd: () => void;
    }
    const RackComponent: React.FC<RackComponentProps> = ({
        rack,
        onAddModule,
        onDeleteRack,
        onEditRack,
        onRemoveModule,
        onEditModule,
        onSaveModule,
        dragItem,
        dragOverItem,
        handleDragStart,
        handleDragEnd,
    }) => {
        const handleDragEnter = (e: React.DragEvent, index: number) => {
            e.preventDefault();
            dragOverItem.current = { rackId: rack.id, moduleIndex: index };
        };
        const handleDrop = () => {
            if (
                !dragItem.current ||
                !dragOverItem.current ||
                dragItem.current.rackId !== dragOverItem.current.rackId
            )
                return;
            const newModules = [...rack.modules];
            const [reorderedItem] = newModules.splice(
                dragItem.current.moduleIndex,
                1
            );
            newModules.splice(
                dragOverItem.current.moduleIndex,
                0,
                reorderedItem
            );
            onSaveModule(rack.id, null); // Placeholder to trigger re-render
        };

        return (
            <div className="flex-shrink-0 w-full max-w-7xl">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {rack.rackConfig.name}
                        </h2>
                        <span className="text-sm text-gray-500">
                            ({rack.rackConfig.address})
                        </span>
                        <button
                            onClick={() => onEditRack(rack)}
                            className="text-gray-400 hover:text-gray-800"
                        >
                            <SettingsIcon />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAddModule(rack.id)}
                            disabled={
                                rack.modules.length >=
                                rack.rackConfig.maxModules
                            }
                            className={`flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-lg shadow transition-colors ${
                                rack.modules.length >=
                                rack.rackConfig.maxModules
                                    ? 'bg-blue-300 text-gray-200 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            <PlusIcon className="w-4 h-4" /> Add Module
                        </button>
                    </div>
                </div>
                <div className="w-full overflow-x-auto p-4 bg-gray-200 rounded-xl shadow-inner mb-8">
                    <div
                        className="flex items-start gap-4 min-w-max"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {rack.modules.map((module, index) => (
                            <div
                                key={module.id}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                            >
                                <ModuleComponent
                                    module={module}
                                    index={index}
                                    onRemove={() =>
                                        onRemoveModule(rack.id, module.id)
                                    }
                                    onEdit={() =>
                                        onEditModule(rack.id, module.id)
                                    }
                                    onDragStart={(e) =>
                                        handleDragStart(e, {
                                            rackId: rack.id,
                                            moduleIndex: index,
                                        })
                                    }
                                    onDragEnd={handleDragEnd}
                                />
                            </div>
                        ))}
                        {rack.modules.length === 0 && (
                            <div className="p-8 text-center text-gray-500 italic flex-grow">
                                This rack is empty.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN APP COMPONENT ---
    const [racks, setRacks] = useState<Rack[]>([]);
    const [editingModule, setEditingModule] = useState<{
        rackId: string;
        moduleId: string;
    } | null>(null);
    const [editingRack, setEditingRack] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { db, userId, isAuthReady } = useContext(FirebaseContext);
    const { showAlert } = useContext(AlertContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag and Drop State
    const dragItem = useRef<any>(null);
    const dragOverItem = useRef<any>(null);
    const handleDragStart = (e: React.DragEvent, item: any) =>
        (dragItem.current = item);
    const handleDragEnd = () => {
        dragItem.current = null;
        dragOverItem.current = null;
    };

    useEffect(() => {
        if (racks.length === 0) {
            handleAddRack();
        }
    }, []);

    // Rack and Module CRUD
    const handleAddRack = () => {
        const newRack: Rack = {
            id: uuidv4(),
            rackConfig: {
                name: `Rack ${racks.length + 1}`,
                address: `192.168.1.${100 + racks.length}`,
                maxModules: 8,
            },
            modules: [],
        };
        setRacks((prev) => [...prev, newRack]);
    };
    const handleSaveRack = (updatedRack: Rack) => {
        setRacks((prev) =>
            prev.map((r) => (r.id === updatedRack.id ? updatedRack : r))
        );
        setEditingRack(null);
    };
    const handleDeleteRack = (rackId: string) => {
        setRacks((prev) => prev.filter((r) => r.id !== rackId));
        setEditingRack(null);
    };
    const handleAddModule = (rackId: string) => {
        setRacks((prev) =>
            prev.map((rack) => {
                if (
                    rack.id === rackId &&
                    rack.modules.length < rack.rackConfig.maxModules
                ) {
                    const defaultType = moduleTypes[0];
                    const newModule: Module = {
                        id: uuidv4(),
                        name: `Module_${rack.modules.length + 1}`,
                        type: defaultType,
                        points: defaultType.points.map((p) => ({
                            ...p,
                            id: uuidv4(),
                            value:
                                p.type === 'DO'
                                    ? false
                                    : p.type === 'AO'
                                      ? 0
                                      : false,
                        })),
                    };
                    return { ...rack, modules: [...rack.modules, newModule] };
                }
                return rack;
            })
        );
    };
    const handleRemoveModule = (rackId: string, moduleId: string) => {
        setRacks((prev) =>
            prev.map((rack) =>
                rack.id === rackId
                    ? {
                          ...rack,
                          modules: rack.modules.filter(
                              (m) => m.id !== moduleId
                          ),
                      }
                    : rack
            )
        );
    };
    const handleEditModule = (rackId: string, moduleId: string) => {
        setEditingModule({ rackId, moduleId });
    };
    const handleSaveModule = (updatedModule: Module) => {
        if (!editingModule) return;
        setRacks((prev) =>
            prev.map((rack) =>
                rack.id === editingModule.rackId
                    ? {
                          ...rack,
                          modules: rack.modules.map((m) =>
                              m.id === updatedModule.id ? updatedModule : m
                          ),
                      }
                    : rack
            )
        );
        setEditingModule(null);
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
            await setDoc(userDocRef, { racks: JSON.stringify(racks) });
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
                if (data.racks) {
                    const parsedRacks = JSON.parse(data.racks);
                    ConfigurationSchema.parse(parsedRacks); // Zod validation
                    setRacks(parsedRacks);
                    showAlert(
                        'Configuration loaded from the cloud!',
                        'success'
                    );
                } else {
                    throw new Error('No racks data found.');
                }
            } else {
                showAlert('No saved configuration found.', 'info');
            }
        } catch (error) {
            console.error('Error loading config:', error);
            showAlert(
                `Failed to load configuration. ${error.message}`,
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Export & Import
    const exportConfig = () => {
        const configJson = JSON.stringify(racks, null, 2);
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
                ConfigurationSchema.parse(importedData); // Zod validation
                setRacks(importedData);
                showAlert('Configuration imported successfully!', 'success');
            } catch (error: any) {
                showAlert(`Failed to import config: ${error.message}`, 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };

    const currentModule = editingModule
        ? racks
              .find((r) => r.id === editingModule.rackId)
              ?.modules.find((m) => m.id === editingModule.moduleId) || null
        : null;
    const currentRack = editingRack
        ? racks.find((r) => r.id === editingRack) || null
        : null;

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center font-sans">
            <div className="w-full max-w-7xl flex flex-col items-center mb-6">
                <div className="flex items-center justify-between w-full mb-4">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        PLC Configurator
                    </h1>
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
                            onClick={handleAddRack}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-bold rounded-lg shadow hover:bg-gray-700 transition-colors"
                        >
                            <PlusSquareIcon /> Add Rack
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-7xl">
                {racks.map((rack) => (
                    <RackComponent
                        key={rack.id}
                        rack={rack}
                        onAddModule={handleAddModule}
                        onDeleteRack={() => handleDeleteRack(rack.id)}
                        onEditRack={() => setEditingRack(rack.id)}
                        onRemoveModule={handleRemoveModule}
                        onEditModule={handleEditModule}
                        onSaveModule={(rackId, updatedModule) => {
                            if (updatedModule) {
                                setRacks((prev) =>
                                    prev.map((r) =>
                                        r.id === rackId
                                            ? {
                                                  ...r,
                                                  modules: r.modules.map((m) =>
                                                      m.id === updatedModule.id
                                                          ? updatedModule
                                                          : m
                                                  ),
                                              }
                                            : r
                                    )
                                );
                            }
                        }}
                        dragItem={dragItem}
                        dragOverItem={dragOverItem}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                    />
                ))}
            </div>

            <ModuleModal
                isOpen={!!currentModule}
                onClose={() => setEditingModule(null)}
                module={currentModule}
                onSave={handleSaveModule}
            />
            <RackModal
                isOpen={!!currentRack}
                onClose={() => setEditingRack(null)}
                rack={currentRack}
                onSave={handleSaveRack}
                onDelete={() => handleDeleteRack(editingRack)}
            />
        </div>
    );
};

export default function Root() {
    return (
        <FirebaseProvider>
            <AlertProvider>
                <ZodLoader>
                    <App />
                </ZodLoader>
            </AlertProvider>
        </FirebaseProvider>
    );
}
