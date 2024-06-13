// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { MeasurementsContainer } from "@/app/measurement/measurements_container";
import ProtectedPage from "@/lib/reusable_components/server_components/protected_page";

export default async function MeasurementsPage() {
  return (
    <ProtectedPage>
      <MeasurementsContainer id="measurements" force_expanded={true} />
    </ProtectedPage>
  );
}
