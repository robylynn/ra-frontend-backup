// Frontend Web Application for RA Products
// Developed by R2 Labs

import ProtectedPage from '@/lib/components/server_components/ProtectedPage';
import SandboxPanel from './sandbox_panel';

export default function SandboxPage() {
    return (
        <ProtectedPage>
            <div className="flex items-center w-full h-full">
                {/* <p>SANDBOX PAGE</p> */}
                <SandboxPanel id="sandbox" className="w-full h-full" />
            </div>
        </ProtectedPage>
    );
}
