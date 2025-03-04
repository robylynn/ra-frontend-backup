// Frontend Web Application for RA Products
// Developed by R2 Labs

import Header from "@/lib/components/client_components/Header";
import { ApplicationStateContainer } from "@/lib/components/client_components/ApplicationStateContainer";
import MessageContainer from "@/lib/components/client_components/MessageContainer";
import ProtectedPage from "@/lib/components/server_components/protected_page";
// import AxisPositionsPanel from "../axis_positions/axis_positions_panel";
import { AxisPositionContainer } from "@/lib/components/client_components/MotionPositionContainer";

import DashboardMainPanel from "./dashboard_panel";

export default function Dashboard() {
  return (
    <ProtectedPage>
      <div className="flex flex-col justify-end h-full gap-y-2">
        <div className="flex col-2 h-[7%] w-full">
          <Header className="h-full w-[30%]" />
          <ApplicationStateContainer className="h-full w-[70%]" />
        </div>
        <AxisPositionContainer />
        <DashboardMainPanel className="h-full grow overflow-y-auto" />
        {/* <MessageContainer className="h-[15%]" /> */}
      </div>
    </ProtectedPage>
  );
}
