// Frontend Web Application for RA Products
// Developed by R2 Labs

import ProtectedPage from '@/lib/components/server_components/ProtectedPage';
import { MultiPlotPanel } from '@/lib/tiles/MultiPlotPanel';

export default function ChartsPage() {
    return (
        <ProtectedPage>
            {/* <PlotPanel id={'test plot panel'} /> */}
            <MultiPlotPanel id={'multi_plot_panel'}/>
        </ProtectedPage>
    );
}
