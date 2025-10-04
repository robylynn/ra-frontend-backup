'use client';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { useContext, useEffect, useState } from 'react';

interface Camera {
    camera_id: string | number;
    camera_type: string;
    device_path: string;
    name: string;
    bus_info?: string;
}

interface CameraStreamContainerProps {
    layout?: 'compact' | 'full';
    showControls?: boolean;
    showSelection?: boolean;
    cameraId?: string;
    streamBaseUrl?: string;
    className?: string;
}

const CameraStreamContainer = ({
    layout = 'full',
    showControls = true,
    showSelection = true,
    cameraId,
    streamBaseUrl,
    className = '',
}: CameraStreamContainerProps) => {
    const { dashboardContext } = useContext(DashboardContext);

    const [availableCameras, setAvailableCameras] = useState<Camera[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<number>(0);
    const [detectingCameras, setDetectingCameras] = useState(false);
    const [detectionError, setDetectionError] = useState<string | null>(null);

    // api proxy
    const defaultStreamBaseUrl = '/api/camera';
    const finalStreamBaseUrl = streamBaseUrl || defaultStreamBaseUrl;

    const currentCameraId = cameraId || `camera${selectedCameraId}`;
    const streamUrl = `${finalStreamBaseUrl}/${currentCameraId}`;

    // Debug prints
    //   console.info(`Camera stream URL: ${streamUrl}`);
    //   console.info(`Using stream base URL: ${finalStreamBaseUrl}`);
    //   console.info(`Current camera ID: ${currentCameraId}`);
    //   console.info(`Selected camera ID: ${selectedCameraId}`);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [modelEnabled, setModelEnabled] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const isCompact = layout === 'compact';

    // Detect available cameras
    const detectCameras = async () => {
        if (!dashboardContext.ros_state?.connected) {
            console.warn(
                'ROS WebSocket not connected yet, skipping camera detection'
            );
            setDetectionError('ROS connection not ready');
            return;
        }

        console.info('Detecting cameras...');
        setDetectingCameras(true);
        setDetectionError(null);

        dashboardContext.ros_services?.camera_services?.detect_cameras(
            (result) => {
                try {
                    if (result.cameras_json) {
                        const cameras = JSON.parse(result.cameras_json);
                        setAvailableCameras(cameras);
                    } else {
                        console.warn('No cameras_json in response');
                        setAvailableCameras([]);
                    }
                } catch (error) {
                    console.error('Failed to parse cameras JSON:', error);
                    setAvailableCameras([]);
                    setDetectionError('Failed to parse camera list');
                }
                setDetectingCameras(false);
            },
            () => {
                console.error('Failed to detect cameras');
                setDetectionError('Failed to detect cameras');
                setDetectingCameras(false);
            },
            (error) => {
                console.error('Error detecting cameras:', error);
                setDetectionError('Error communicating with camera service');
                setDetectingCameras(false);
            }
        );
    };

    useEffect(() => {
        if (dashboardContext.ros_state?.connected) {
            const timer = setTimeout(() => {
                detectCameras();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [dashboardContext.ros_state?.connected]);

    const startStream = async () => {
        console.info('Starting camera streaming...');
        setLoading(true);
        setError(null);

        const selectedCamera = availableCameras.find(
            (camera) =>
                camera.camera_id === selectedCameraId ||
                camera.camera_id.toString() === selectedCameraId.toString()
        );

        if (!selectedCamera) {
            setError('No camera selected');
            setLoading(false);
            return;
        }

        let numericCameraId: number;
        let isUvcCamera: boolean;

        if (selectedCamera.camera_type === 'depthai') {
            numericCameraId = 99;
            isUvcCamera = false;
        } else {
            if (typeof selectedCamera.camera_id === 'string') {
                const parsed = parseInt(selectedCamera.camera_id, 10);
                if (isNaN(parsed)) {
                    setError(`Invalid camera ID: ${selectedCamera.camera_id}`);
                    setLoading(false);
                    return;
                }
                numericCameraId = parsed;
            } else {
                numericCameraId = selectedCamera.camera_id as number;
            }

            isUvcCamera =
                selectedCamera.device_path?.startsWith('/dev/video') ||
                selectedCamera.camera_type === 'uvc' ||
                selectedCamera.camera_type === 'global_shutter';
        }

        console.log(
            `Starting camera: ID=${numericCameraId}, UVC=${isUvcCamera}, Type=${selectedCamera.camera_type}`
        );

        dashboardContext.ros_services.camera_services.start_camera_stream(
            numericCameraId,
            isUvcCamera,
            (result) => {
                setTimeout(() => {
                    setIsStreaming(true);
                    setLoading(false);
                    setError(null);
                }, 2000);
            },
            () => {
                setError('Failed to start camera stream');
                setLoading(false);
            },
            (error) => {
                console.error('Camera start error:', error);
                setError('Error communicating with camera service');
                setLoading(false);
            }
        );
    };

    const stopStream = async () => {
        console.info('Stopping camera stream...');
        setLoading(true);

        const selectedCamera = availableCameras.find(
            (camera) =>
                camera.camera_id === selectedCameraId ||
                camera.camera_id.toString() === selectedCameraId.toString()
        );

        if (!selectedCamera) {
            setError('No camera selected');
            setLoading(false);
            return;
        }

        let numericCameraId: number;
        let isUvcCamera: boolean;

        if (selectedCamera.camera_type === 'depthai') {
            numericCameraId = 99;
            isUvcCamera = false;
        } else {
            if (typeof selectedCamera.camera_id === 'string') {
                const parsed = parseInt(selectedCamera.camera_id, 10);
                if (isNaN(parsed)) {
                    setError(`Invalid camera ID: ${selectedCamera.camera_id}`);
                    setLoading(false);
                    return;
                }
                numericCameraId = parsed;
            } else {
                numericCameraId = selectedCamera.camera_id as number;
            }
            isUvcCamera =
                selectedCamera.device_path?.startsWith('/dev/video') ||
                selectedCamera.camera_type === 'uvc' ||
                selectedCamera.camera_type === 'global_shutter';
        }

        dashboardContext.ros_services?.camera_services.stop_camera_stream(
            numericCameraId,
            isUvcCamera,
            (result) => {
                setTimeout(() => {
                    setIsStreaming(false);
                    setLoading(false);
                    setError(null);
                }, 2000);
            },
            () => {
                setError('Failed to stop camera stream');
                setLoading(false);
            },
            (error) => {
                console.error('Camera stop error:', error);
                setLoading(false);
            }
        );
    };

    const handleCaptureImage = async () => {
        if (!isStreaming) return;

        const selectedCamera = availableCameras.find(
            (camera) =>
                camera.camera_id === selectedCameraId ||
                camera.camera_id.toString() === selectedCameraId.toString()
        );

        if (!selectedCamera) {
            setError('No camera selected');
            return;
        }

        let numericCameraId: number;

        if (selectedCamera.camera_type === 'depthai') {
            numericCameraId = 99;
        } else {
            if (typeof selectedCamera.camera_id === 'string') {
                const parsed = parseInt(selectedCamera.camera_id, 10);
                if (isNaN(parsed)) {
                    setError(`Invalid camera ID: ${selectedCamera.camera_id}`);
                    return;
                }
                numericCameraId = parsed;
            } else {
                numericCameraId = selectedCamera.camera_id as number;
            }
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `camera${numericCameraId}_${timestamp}.jpg`;
        const savePath = `/test/path/${filename}`;

        dashboardContext.ros_services?.camera_services.capture_frame(
            numericCameraId,
            savePath,
            (result) => {
                console.log('Image capture result:', result);
            },
            () => {
                setError('Failed to capture image');
            },
            (error) => {
                console.error('Image capture error:', error);
                setError('Unable to communicate with camera service');
            }
        );
    };

    const handleToggleModel = async () => {
        if (!isStreaming) return;

        dashboardContext.ros_services?.camera_services.toggle_ai(
            selectedCameraId,
            !modelEnabled,
            '',
            (result) => {
                console.log('AI toggle result:', result);
                setModelEnabled(!modelEnabled);
            },
            () => {
                setError('Failed to toggle AI');
            },
            (error) => {
                console.error('AI toggle error:', error);
                setError('Unable to communicate with AI service');
            }
        );
    };

    return (
        <div className={`w-full h-full flex flex-col ${className}`}>
            {/* Camera Selection */}
            {!isStreaming && showSelection && (
                <div
                    className={`${isCompact ? 'p-2' : 'p-3'} bg-gray-800 border-b border-gray-600`}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <label
                            className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-300`}
                        >
                            Camera:
                        </label>
                        <select
                            value={selectedCameraId}
                            onChange={(e) =>
                                setSelectedCameraId(Number(e.target.value))
                            }
                            disabled={detectingCameras || loading}
                            className={`flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded ${
                                isCompact ? 'text-xs' : 'text-sm'
                            } text-white disabled:opacity-50`}
                        >
                            {availableCameras.length === 0 ? (
                                <option value="">No cameras detected</option>
                            ) : (
                                availableCameras.map((camera) => (
                                    <option
                                        key={camera.camera_id}
                                        value={camera.camera_id}
                                    >
                                        Camera {camera.camera_id} -{' '}
                                        {camera.name}
                                    </option>
                                ))
                            )}
                        </select>
                        <button
                            onClick={detectCameras}
                            disabled={detectingCameras || loading}
                            className={`px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded ${
                                isCompact ? 'text-xs' : 'text-xs'
                            }`}
                        >
                            {detectingCameras ? '🔍' : '🔄'}
                        </button>
                    </div>
                    {detectionError && (
                        <p className="text-red-400 text-xs">{detectionError}</p>
                    )}
                </div>
            )}

            {/* Camera Stream */}
            <div className="flex-1 flex items-center justify-center relative">
                {!isStreaming ? (
                    <div className="text-center text-gray-400">
                        <div
                            className={`${isCompact ? 'text-2xl' : 'text-4xl'} mb-4`}
                        >
                            📷
                        </div>
                        <p
                            className={`${isCompact ? 'text-sm' : 'text-lg'} mb-2`}
                        >
                            {availableCameras.length > 0
                                ? `Camera ${selectedCameraId} Ready`
                                : 'No Cameras Available'}
                        </p>
                        {error && (
                            <p className="text-red-400 text-xs mb-4">{error}</p>
                        )}
                        <button
                            onClick={startStream}
                            disabled={loading || availableCameras.length === 0}
                            className={`px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded ${
                                isCompact ? 'text-xs' : 'text-sm'
                            } disabled:opacity-50`}
                        >
                            {loading ? 'Starting...' : '▶️ Start Stream'}
                        </button>
                    </div>
                ) : (
                    <>
                        <img
                            src={streamUrl}
                            alt={`Camera ${selectedCameraId} stream`}
                            className="max-w-full max-h-full object-contain"
                            style={{ imageRendering: 'auto' }}
                            onLoad={() => setLoading(false)}
                            onError={() => {
                                setLoading(false);
                                setError('Failed to load camera stream');
                                setIsStreaming(false);
                            }}
                        />

                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="text-white text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                    <p
                                        className={
                                            isCompact ? 'text-xs' : 'text-sm'
                                        }
                                    >
                                        Loading stream...
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                                <div className="text-center text-red-400">
                                    <p
                                        className={
                                            isCompact ? 'text-xs' : 'text-sm'
                                        }
                                    >
                                        Stream Error:
                                    </p>
                                    <p className="text-xs">{error}</p>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            startStream();
                                        }}
                                        className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Control Buttons */}
            {showControls && (
                <div
                    className={`${isCompact ? 'p-2' : 'p-3'} bg-gray-800 border-t border-gray-600`}
                >
                    <div className="flex gap-2 justify-center mb-2">
                        <button
                            onClick={isStreaming ? stopStream : startStream}
                            disabled={
                                loading ||
                                (!isStreaming && availableCameras.length === 0)
                            }
                            className={`
                px-3 py-1 text-xs font-medium rounded-md transition-colors
                ${
                    isStreaming
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        >
                            {isStreaming ? '⏹️ Stop' : '▶️ Start'}
                        </button>
                    </div>

                    {/* Camera Controls - Only show when streaming */}
                    {isStreaming && (
                        <>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => {
                                        setIsCapturing(true);
                                        handleCaptureImage();
                                        setTimeout(
                                            () => setIsCapturing(false),
                                            500
                                        );
                                    }}
                                    disabled={isCapturing || !isStreaming}
                                    className="px-3 py-2 text-xs font-medium rounded-md transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white"
                                >
                                    {isCapturing
                                        ? '📸 Capturing...'
                                        : '📸 Capture'}
                                </button>

                                <button
                                    onClick={handleToggleModel}
                                    disabled={!isStreaming}
                                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                        modelEnabled
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-gray-600 hover:bg-gray-700'
                                    } text-white disabled:opacity-50`}
                                >
                                    🤖 AI {modelEnabled ? 'ON' : 'OFF'}
                                </button>

                                <button
                                    onClick={() => setIsRecording(!isRecording)}
                                    disabled={!isStreaming}
                                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                        isRecording
                                            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                                            : 'bg-gray-600 hover:bg-gray-700'
                                    } text-white disabled:opacity-50`}
                                >
                                    {isRecording ? '⏹️ Stop Rec' : '🔴 Record'}
                                </button>
                            </div>

                            <div className="flex gap-4 justify-center mt-2 text-xs text-gray-400">
                                <span>Camera {selectedCameraId}</span>
                                {isRecording && (
                                    <span className="text-red-400 animate-pulse">
                                        ● Recording
                                    </span>
                                )}
                                {modelEnabled && (
                                    <span className="text-green-400">
                                        ● AI Enabled
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// Compact version
export const CompactCameraStream = (
    props: Omit<CameraStreamContainerProps, 'layout'>
) => <CameraStreamContainer {...props} layout="compact" />;

export const SimpleCameraStream = (
    props: Omit<CameraStreamContainerProps, 'showControls' | 'showSelection'>
) => (
    <CameraStreamContainer
        {...props}
        showControls={false}
        showSelection={false}
    />
);

export default CameraStreamContainer;
