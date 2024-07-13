// Frontend Web Application for RA Products
// Developed by R2 Labs

import { ChartPanelContainer } from "@/app/charts/chart_panel_container";
import ProtectedPage from "@/lib/components/server_components/protected_page";

export default function ChartsPage() {
  return (
    <ProtectedPage>
      <ChartPanelContainer id="charts" update_period_seconds={2} />
    </ProtectedPage>
  );
}
