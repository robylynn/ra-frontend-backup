// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import ProtectedPage from "@/lib/reusable_components/server_components/protected_page";

import ControlContainer from "./control_container";

export default function ControlsPage() {
  return (
    <ProtectedPage>
      <ControlContainer id={"controls"} />
    </ProtectedPage>
  );
}
