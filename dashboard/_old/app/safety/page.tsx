// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { SafetyContainer } from "@/app/safety/safety_container";
import ProtectedPage from "@/lib/components/server_components/protected_page";

export default async function SafetyPage() {
  return (
    <ProtectedPage>
      <SafetyContainer id="measurements" force_expanded={true} />
    </ProtectedPage>
  );
}
