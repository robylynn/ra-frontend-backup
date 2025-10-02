// Frontend Web Application for RA Products
// Developed by R2 Labs

import { LabelStudioComponent } from '@/lib/components/client_components/LabelStudioComponent';
import { AxisPositionContainer } from '@/lib/components/client_components/MotionPositionContainer';

export default function JogContainerPage() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col gap-y-4">
                <AxisPositionContainer />
            </div>
            <LabelStudioComponent/>
        </div>
    );
}
