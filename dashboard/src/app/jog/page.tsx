// Frontend Web Application for RA Products
// Developed by R2 Labs

import JogContainer from "@/lib/components/client_components/JogContainer";
import { AxisPositionContainer } from "@/lib/components/client_components/MotionPositionContainer";

export default function JogContainerPage() {
  return (
    <div>
      <div className="flex flex-col gap-y-4">
        <AxisPositionContainer />
      </div> 
      <div className="flex flex-col gap-y-4">
        <JogContainer />
      </div>
    </div>
  );
}
