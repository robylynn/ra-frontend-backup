// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import ProtectedPage from '@/lib/components/server_components/protected_page';
import AdministrationPanel from './administration_panel';

export default function AdministrationPage() {
    return (
        <ProtectedPage>
            <div className="flex items-center w-full h-full">
                {/* <p>SANDBOX PAGE</p> */}
                <AdministrationPanel id="sandbox" className="w-full h-full" />
            </div>
        </ProtectedPage>
    );
}
