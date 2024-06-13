// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { ControlLoopsContainer } from "@/app/control_loops/control_loops_container";
import ProtectedPage from "@/lib/reusable_components/server_components/protected_page";

export default async function MeasurementsPage() {
  return (
    <ProtectedPage>
      <ControlLoopsContainer id="control_loops" force_expanded={true} />
    </ProtectedPage>
  );
}
