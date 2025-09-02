// Frontend Web Application for RA Products
// Developed by R2 Labs

import ProtectedPage from '@/lib/components/server_components/ProtectedPage';
// import ChartMainPanel from './chart_panel';
// import { PlotPanel } from '@/lib/tiles/PlotPanel';
import { MultiPlotPanel } from '@/lib/tiles/MultiPlotPanel';

export default function ChartsPage() {
    return (
        <ProtectedPage>
            {/* <PlotPanel id={'test plot panel'} /> */}
            <MultiPlotPanel/>
        </ProtectedPage>
    );
}
