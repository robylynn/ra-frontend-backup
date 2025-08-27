// Frontend Web Application for RA Products
// Developed by R2 Labs

import ProtectedPage from '@/lib/components/server_components/protected_page';
import ChartMainPanel from './chart_panel';

export default function ChartsPage() {
    return (
        <ProtectedPage>
            <div className="flex items-center w-full h-full">
                <ChartMainPanel className="h-[80%] grow overflow-y-auto" />
            </div>
        </ProtectedPage>
    );
}
