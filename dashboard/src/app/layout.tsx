// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import { Roboto } from "next/font/google";

import NextAuthProvider from "@/lib/auth/next_auth_provider";
import { ConnectionStateIndicator } from "@/lib/reusable_components/client_components/connection_state_container";
import DashboardContextProvider from "@/lib/reusable_components/client_components/dashboard_context_wrapper";
import DataUpdater from "@/lib/reusable_components/client_components/data_updater";
import LinksColumn from "@/lib/reusable_components/server_components/links_column";


const inter = Inter({ subsets: ["latin"] });
// const roboto = Roboto({ subsets: ['latin'] })

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
        {/* <WebSocketProvider
          url="ws://127.0.0.1:3000/api/ws_stream"
        > */}
        
        <DashboardContextProvider>
          <DataUpdater
            update_period_seconds={1}
            configuration_update_period_seconds={5}
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
        </DashboardContextProvider>
        {/* </WebSocketProvider> */}
      </NextAuthProvider>
    </html>
  );
}
