// Frontend Web Application for RA Products
// Developed by R2 Labs

import ProtectedPage from "@/lib/components/server_components/protected_page";
import { AxisPositionContainer } from "@/lib/components/client_components/MotionPositionContainer";

export default function AxisdPositionPage() {
  return (
    <ProtectedPage>
      <div className="flex items-center w-full h-full">
          <AxisPositionContainer />
      </div>
    </ProtectedPage>

  );
}
