'use client';

import ImageArchiveContainer from '@/lib/components/client_components/ImageArchiveContainer';
import { Dispatch, SetStateAction } from 'react';
import { SimplifiedDashboardHeaderContainer } from '../components/server_components/SimplifiedDashboardHeaderContainer';

export const ImageArchivePanel = (props: {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
    variant?: 'full' | 'compact' | 'simple';
}) => {
    const { variant = 'full' } = props;

    return (
        <SimplifiedDashboardHeaderContainer
            title="Images"
            icon_path={'/icons/device.svg'}
            className={props.className || ''}
        >
            <div className="w-full h-full bg-gray-900">
                {variant === 'compact' && (
                    <ImageArchiveContainer
                        layout="compact"
                        showFilters={true}
                        showDetails={true}
                        maxImages={2}
                        refreshInterval={8000}
                    />
                )}

                {variant === 'simple' && (
                    <ImageArchiveContainer
                        layout="full"
                        showFilters={false}
                        showDetails={false}
                        maxImages={3}
                        refreshInterval={10000}
                    />
                )}

                {variant === 'full' && (
                    <ImageArchiveContainer
                        layout="full"
                        showFilters={true}
                        showDetails={true}
                        maxImages={12}
                        refreshInterval={10000}
                    />
                )}
            </div>
        </SimplifiedDashboardHeaderContainer>
    );
};

// Export different variations
type ImageArchivePanelProps = {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
};

export const CompactImageArchivePanel = (props: ImageArchivePanelProps) => {
    return <ImageArchivePanel {...props} variant="compact" />;
};

export const SimpleImageArchivePanel = (props: ImageArchivePanelProps) => {
    return <ImageArchivePanel {...props} variant="simple" />;
};
