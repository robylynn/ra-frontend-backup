// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import CameraStreamContainer from '@/lib/components/client_components/CameraStreamContainer';
import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import { Dispatch, SetStateAction } from 'react';

export const CameraStreamPanel = (props: {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
    variant?: 'full' | 'compact' | 'simple';
    cameraId?: string;
}) => {
    const { variant = 'full', cameraId } = props;

    return (
        <DashboardHeaderContainer
            header_text={`Camera ${cameraId || 'Stream'}`}
            icon_path={'/icons/device.svg'}
            className={props.className || ''}
            fill_tile_id={props.id}
            fill_tile_callback={props.fill_tile_callback}
        >
            <div className="w-full h-full bg-gray-900">
                {variant === 'compact' && (
                    <CameraStreamContainer
                        layout="compact"
                        showControls={true}
                        showSelection={true}
                        cameraId={cameraId}
                    />
                )}

                {variant === 'simple' && (
                    <CameraStreamContainer
                        layout="full"
                        showControls={false}
                        showSelection={false}
                        cameraId={cameraId}
                    />
                )}

                {variant === 'full' && (
                    <CameraStreamContainer
                        layout="full"
                        showControls={true}
                        showSelection={true}
                        cameraId={cameraId}
                    />
                )}
            </div>
        </DashboardHeaderContainer>
    );
};

// Export different variations
type CameraStreamPanelProps = {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
    variant?: 'full' | 'compact' | 'simple';
    cameraId?: string;
};

export const CompactCameraStreamPanel = (
    props: Omit<CameraStreamPanelProps, 'variant'>
) => {
    return <CameraStreamPanel {...props} variant="compact" />;
};

export const SimpleCameraStreamPanel = (
    props: Omit<CameraStreamPanelProps, 'variant'>
) => {
    return <CameraStreamPanel {...props} variant="simple" />;
};
