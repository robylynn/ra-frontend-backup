// Frontend Web Application for RA Products
// Developed by R2 Labs

import ProtectedPage from '@/lib/components/server_components/ProtectedPage';
import { OPCConfigurationPanel } from '@/lib/tiles/OPCConfigurationPanel';

export default function OPCUAPage() {
    return (
        <ProtectedPage>
            <OPCConfigurationPanel id='opc_panel'/>
        </ProtectedPage>
    );
}
