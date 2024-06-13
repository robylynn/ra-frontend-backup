// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import BarGaugeContainer from "@/lib/reusable_components/client_components/bar_gauge_container";
import Header from "@/lib/reusable_components/client_components/header";
import MessageContainer from "@/lib/reusable_components/client_components/message_container";
import ProtectedPage from "@/lib/reusable_components/server_components/protected_page";

import DashboardMainPanel from "./dashboard_panel";

export default function Dashboard() {
  return (
    <ProtectedPage>
      <div className="flex flex-col justify-end h-full">
        <Header className="h-[10%] w-full" />
        {/* <BarGaugeContainer gauge_bar_height_px={40} className="h-[20%]" /> */}
        <DashboardMainPanel className="h-[30%] grow" />
        <MessageContainer className="h-[15%]" />
      </div>
    </ProtectedPage>
  );
}
