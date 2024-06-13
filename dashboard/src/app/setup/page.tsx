// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { SetupContainer } from "@/app/setup/setup_container";
import ProtectedPage from "@/lib/reusable_components/server_components/protected_page";

export default async function SetupPage() {
  return (
    <ProtectedPage>
      <SetupContainer id="setup" force_expanded={true} />
    </ProtectedPage>
  );
}
