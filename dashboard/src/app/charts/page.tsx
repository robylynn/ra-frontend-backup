// Frontend Web Application for RA Products
// Developed by R2 Labs

import ProtectedPage from '@/lib/components/server_components/protected_page';
// import ChartMainPanel from './chart_panel';
import { PlotPanel } from '@/lib/tiles/PlotPanel';

export default function ChartsPage() {
    return (
        <ProtectedPage>
            <PlotPanel id={'test plot panel'} />
        </ProtectedPage>
    );
}
