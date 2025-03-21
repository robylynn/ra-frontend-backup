// Frontend Web Application for RA Products
// Developed by R2 Labs

import IOPlotContainer from '@/lib/components/client_components/IOPlotContainer';
import { IOPointType } from '@/lib/models/api_models';

export default function AnalogInputPlotPage() {
    return (
        <>
            <IOPlotContainer point_type={IOPointType.ANALOG_INPUT} />
            <IOPlotContainer point_type={IOPointType.DIGITAL_INPUT} />
        </>
    );
}
