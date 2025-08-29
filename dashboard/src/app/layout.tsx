// Frontend Web Application for RA Products
// Developed by R2 Labs

// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';

// import NextAuthProvider from '@/lib/auth/next_auth_provider';
// import ConnectionStateIndicator from '@/lib/components/client_components/ConnectionStateContainer';
// import DashboardContextProvider from '@/lib/components/client_components/DashboardContextWrapper';
// import { SimpleDataUpdater } from '@/lib/components/client_components/DataUpdater';
// import { IOPointContextProvider } from '@/lib/components/client_components/IOPointContext';
// import { WebSocketProvider } from '@/lib/components/client_components/WebsocketSubscriptionProvider';
// import LinksColumn from '@/lib/components/server_components/links_column';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//     title: 'R2 Controller Frontend',
//     description: 'Built by R2 Labs, LLC',
// };

// export default function RootLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     return (
//         <html lang="en" className="dark">
//             <NextAuthProvider>
//                 <DashboardContextProvider>
//                     <WebSocketProvider>
//                         {/* <DataUpdater
//                         update_period_seconds={1}
//                         configuration_update_period_seconds={5}
//                     /> */}
//                         <SimpleDataUpdater />
//                         {/* <RAWebSocket
//                         websocket_path="/api/socket"
//                         // websocket_path={`${process.env.CONTROLLER_URI}/api/socket`}
//                         reconnect_period_seconds={1}
//                     /> */}
//                         {/* <RARosWebsocket
//                         websocketUrl={`/api/socket?target=ros`}
//                         reconnectInterval={3000}
//                     /> */}
//                         {/* <RAServerWebSocket
//                         websocketUrl="/api/socket?target=stream&table_name=sensor_data&historical_limit=100"
//                         reconnectInterval={3000}
//                     /> */}
//                         <body className={inter.className}>
//                             <div className="flex flex-col w-screen h-screen bg-no-repeat bg-cover dark:bg-dark-background-image/50 dark:bg-zinc-700 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-sky-900/50 overflow-clip">
//                                 <div className="grid grid-cols-[15%_85%] grid-rows-1 h-[75%] grow w-full">
//                                     <div className="h-full">
//                                         <LinksColumn />
//                                     </div>
//                                     <IOPointContextProvider>
//                                         {children}
//                                     </IOPointContextProvider>
//                                 </div>
//                                 <ConnectionStateIndicator />
//                             </div>
//                         </body>
//                     </WebSocketProvider>
//                 </DashboardContextProvider>
//             </NextAuthProvider>
//         </html>
//     );
// }

// Frontend Web Application for RA Products
// Developed by R2 Labs

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import NextAuthProvider from '@/lib/auth/next_auth_provider';
import ConnectionStateIndicator from '@/lib/components/client_components/ConnectionStateContainer';
import DashboardContextProvider from '@/lib/components/client_components/DashboardContextWrapper';
// import { SimpleDataUpdater } from '@/lib/components/client_components/DataUpdater'; // REMOVED: Moved to AuthenticatedAppProviders
// import { IOPointContextProvider } from '@/lib/components/client_components/IOPointContext'; // REMOVED: Moved to AuthenticatedAppProviders
// import { WebSocketProvider } from '@/lib/components/client_components/WebsocketSubscriptionProvider'; // REMOVED: Moved to AuthenticatedAppProviders
import { AlertProvider } from '@/lib/components/client_components/AlertProvider';
import AuthenticatedComponentProvider from '@/lib/components/client_components/AuthenticatedComponentProvider';
import LinksColumn from '@/lib/components/server_components/LinksColumn';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'R2 Controller Frontend',
    description: 'Built by R2 Labs, LLC',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
                {' '}
                {/* Move body tag outside Providers to wrap all content */}
                <AlertProvider>
                    <NextAuthProvider>
                        <DashboardContextProvider>
                            {/* --- IMPORTANT CHANGE: Conditionally render providers --- */}
                            <AuthenticatedComponentProvider>
                                <div className="flex flex-col w-screen h-screen bg-no-repeat bg-cover dark:bg-dark-background-image/50 dark:bg-zinc-700 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-sky-900/50 overflow-clip">
                                    <div className="grid grid-cols-[15%_85%] grid-rows-1 h-[75%] grow w-full">
                                        <div className="h-full">
                                            {/* LinksColumn should ideally only show authenticated links when authenticated */}
                                            <LinksColumn />
                                        </div>
                                        {children}{' '}
                                        {/* This is your actual page content */}
                                    </div>
                                    <ConnectionStateIndicator />
                                </div>
                            </AuthenticatedComponentProvider>
                            {/* --- END IMPORTANT CHANGE --- */}
                        </DashboardContextProvider>
                    </NextAuthProvider>
                </AlertProvider>
            </body>
        </html>
    );
}
