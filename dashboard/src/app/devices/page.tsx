// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import DevicesContainer from "@/app/devices/devices_container";
import ProtectedPage from "@/lib/reusable_components/server_components/protected_page";

export default async function DevicePage() {
  return (
    <ProtectedPage>
      {/* <DevicesContainer id="devices" force_expanded={true} /> */}
      <div className="h-[90%] w-[90%]">
        <iframe
          src="/devices/1"
          className="h-[90%] w-[90%]"
        />
      </div>
    </ProtectedPage>
  );
}
