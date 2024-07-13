// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { ControlLoopsContainer } from "./control_loops_container";
import ProtectedPage from "@/lib/components/server_components/protected_page";

export default async function MeasurementsPage() {
  return (
    <ProtectedPage>
      <ControlLoopsContainer id="control_loops" force_expanded={true} />
    </ProtectedPage>
  );
}
