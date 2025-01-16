// Frontend Web Application for RA Products
// Developed by R2 Labs

import Header from "@/lib/components/client_components/Header";
import MessageContainer from "@/lib/components/client_components/MessageContainer";
import ProtectedPage from "@/lib/components/server_components/protected_page";

import DashboardMainPanel from "./dashboard_panel";

export default function Dashboard() {
  return (
    <ProtectedPage>
      <div className="flex flex-col justify-end h-full">
        <Header className="h-[10%] w-full" />
        <DashboardMainPanel className="h-[45%] grow overflow-y-auto" />
        {/* <MessageContainer className="h-[15%]" /> */}
      </div>
    </ProtectedPage>
  );
}
