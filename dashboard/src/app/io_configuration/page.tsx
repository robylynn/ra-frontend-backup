// Frontend Web Application for RA Products
// Developed by R2 Labs

// import IOConfigurationContainer from '@/app/io_configuration/io_configuration_container';
import ProtectedPage from '@/lib/components/server_components/ProtectedPage';
import { IOConfigurationPanel } from '@/lib/tiles/IOConfigurationPanel';


export default function IOConfigurationPage() {
    return (
        <ProtectedPage>
            {/* <PlotPanel id={'test plot panel'} /> */}
            <IOConfigurationPanel id={'io_configuration_panel'} />;
        </ProtectedPage>
    );
}