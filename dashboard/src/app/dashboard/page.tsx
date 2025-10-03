// Frontend Web Application for RA Products
// Developed by R2 Labs

import { ApplicationStateContainer } from '@/lib/components/client_components/ApplicationStateContainer';
import Header from '@/lib/components/client_components/Header';
import { AxisPositionContainer } from '@/lib/components/client_components/MotionPositionContainer';
import ProtectedPage from '@/lib/components/server_components/ProtectedPage';

import DashboardMainPanel from './dashboard_panel';

export default function Dashboard() {
    return (
        <ProtectedPage>
            <div className="flex flex-col justify-end h-full w-full gap-y-2">
                {/* <div className="flex col-2 h-[7%] w-full"> */}
                    <Header className="h-[7%] w-full" />
                    {/* <ApplicationStateContainer className="h-full w-[70%]" /> */}
                {/* </div> */}
                {/* <AxisPositionContainer /> */}
                <DashboardMainPanel className="h-full grow overflow-y-auto" />
            </div>
        </ProtectedPage>
    );
}
