// Frontend Web Application for RA Products
// Developed by R2 Labs

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import NextAuthProvider from "@/lib/auth/next_auth_provider";
import ConnectionStateIndicator from "@/lib/components/client_components/ConnectionStateContainer";
import DashboardContextProvider from "@/lib/components/client_components/DashboardContextWrapper";
import DataUpdater from "@/lib/components/client_components/DataUpdater";
import LinksColumn from "@/lib/components/server_components/links_column";
import RAWebSocket from "@/lib/components/client_components/WebsocketClient";
import { AnalogInputProvider } from "@/lib/components/client_components/AnalogInputContext";
import { DigitalInputProvider } from "@/lib/components/client_components/DigitalInputContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "R2 Controller Frontend",
  description: "Built by R2 Labs, LLC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <NextAuthProvider>
        <DashboardContextProvider>
          <AnalogInputProvider>
            <DigitalInputProvider>
            <DataUpdater
              update_period_seconds={1}
              configuration_update_period_seconds={5}
            />
            <RAWebSocket
              websocket_path="/api/socket"
              reconnect_period_seconds={1}
            />
            <body className={inter.className}>
              <div className="flex flex-col w-screen h-screen bg-no-repeat bg-cover dark:bg-dark-background-image/50 dark:bg-zinc-700 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-sky-900/50 overflow-clip">
                <div className="grid grid-cols-[15%_85%] grid-rows-1 h-[75%] grow w-full">
                  <div className="h-full">
                    <LinksColumn />
                  </div>
                  {children}
                </div>
                <ConnectionStateIndicator />
              </div>
            </body>
            </DigitalInputProvider>
          </AnalogInputProvider>
        </DashboardContextProvider>
      </NextAuthProvider>
    </html>
  );
}
