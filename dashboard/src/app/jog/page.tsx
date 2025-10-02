// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client"

import JogContainer from '@/lib/components/client_components/JogContainer';
import { AxisPositionContainer } from '@/lib/components/client_components/MotionPositionContainer';

export default function JogContainerPage() {
    return (
        <div className="h-[85%]">
            <div className="flex flex-col gap-y-4">
                <AxisPositionContainer />
            </div>
            <div className="flex flex-col gap-y-4">
                <JogContainer />
            </div>
            {/* <iframe
                className="h-full w-full"
                // src={'http://localhost:8080'}
                // src={'/labelstudio'}
                src={`http://${window.location.hostname}:8080`}
                // title={title}
                // width="100%"
                // height="100%"
                style={{ border: 'none' }} // Remove the default frame border
                // Sandbox is highly recommended for security if the content is untrusted
                // sandbox="allow-scripts allow-same-origin allow-popups"
            /> */}
        </div>
    );
}
