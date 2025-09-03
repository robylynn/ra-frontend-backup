// Frontend Web Application for RA Products
// Developed by R2 Labs

"uer server"

// import { auth } from '@/auth';
// import Image from 'next/image';
// import Link from 'next/link';

// // import authOptions from '@/lib/auth/auth_options';
// import StateReadout from '@/lib/components/client_components/StateReadout';

// function PageTab(props: {
//     icon_path: string;
//     tab_text: string;
//     href: string;
//     className?: string;
//     text_className?: string;
// }) {
//     return (
//         <Link
//             href={props.href}
//             className={`
//             grid 
//             grid-cols-[30%_70%] 
//             text-black 
//             hover:bg-slate-400 
//             hover:text-white 
//             hover:no-underline 
//             focus:border-0
//             p-2 
//             content-center 
//             items-center 
//             rounded-xl 
//             justify-around 
//             text-sm
//             w-[90%]
//             ${props.className ?? ''}
//             `}
//         >
//             <Image
//                 src={props.icon_path}
//                 alt={props.tab_text}
//                 className="dark:invert-[.58] dark:sepia-[.8] dark:saturate-[3.85] dark:brightness-[.95] dark:contrast-[.94] dark:hue-rotate-[65deg]"
//                 width={35}
//                 height={35}
//                 priority
//             />
//             <p
//                 className={`font-bold dark:text-white m-0 p-0 ${
//                     props.text_className ?? ''
//                 }`}
//             >
//                 {props.tab_text}
//             </p>
//         </Link>
//     );
// }

// export default async function LinksColumn(props: { className?: string }) {
//     let username: string;
//     // const session = await getServerSession(authOptions).then(
//     const session = await auth().then(
//         (session) => session
//     );
//     if (session == null) {
//         username = 'NONE';
//     } else {
//         username = session.user?.name ?? 'UNAVAILABLE';
//     }

//     return (
//         <div className="flex flex-col justify-between w-full h-full">
//             <div className="flex flex-col items-center">
//                 <div
//                     className={`flex flex-row items-center justify-around w-full m-2 ${
//                         props.className ?? ''
//                     }`}
//                 >
//                     <Link href={'http://r2-labs.io'}>
//                         <Image
//                             src={'/branding/new_r2_logo.svg'}
//                             alt="RA Frontend Built by R2 Labs"
//                             // className="dark:invert"
//                             width={100}
//                             height={100}
//                             priority
//                         />
//                     </Link>
//                     <PageTab
//                         tab_text={username}
//                         icon_path={'/icons/user.svg'}
//                         href={
//                             session == null
//                                 ? '/api/auth/signin'
//                                 : '/api/auth/signout'
//                         }
//                         className="border rounded-full h-fit w-fit"
//                         text_className="text-xs text-center"
//                     />
//                 </div>
//                 {session != null ? (
//                     <div className="flex flex-col items-center w-full space-y-1">
//                         <PageTab
//                             tab_text={'Dashboard'}
//                             icon_path={'/icons/Dashboard.svg'}
//                             href={'/dashboard'}
//                         />
//                         <PageTab
//                             tab_text={'Application'}
//                             icon_path={'/icons/application.svg'}
//                             href={'/application_sandbox'}
//                         />
//                         <PageTab
//                             tab_text={'Data Charts'}
//                             icon_path={'/icons/Diagnose.svg'}
//                             href={'/charts'}
//                         />
//                         <PageTab
//                             tab_text={'Jogging'}
//                             icon_path={'/icons/jog.png'}
//                             href={'/jog'}
//                         />
//                         <PageTab
//                             tab_text={'Diagnostics'}
//                             icon_path={'/icons/grid.svg'}
//                             href={'/diagnostics'}
//                         />
//                         <PageTab
//                             tab_text={'Administration'}
//                             icon_path={'/icons/user.svg'}
//                             href={'/administration'}
//                         />
//                     </div>
//                 ) : (
//                     <></>
//                 )}
//             </div>
//             {session != null ? <StateReadout /> : <></>}
//         </div>
//     );
// }


// lib/components/server_components/links_column.tsx
// This is a Server Component – no "use client" directive is needed.

import { auth } from '@/auth'; // Server-side authentication helper
import Image from 'next/image'; // Works in Server Components
import Link from 'next/link'; // Works in Server Components
import StateReadout from '@/lib/components/client_components/StateReadout';

// PageTab is designed to be rendered within a Server Component,
// as it primarily handles UI and navigation links.
function PageTab(props: {
    icon_path: string;
    tab_text: string;
    href: string;
    className?: string;
    text_className?: string;
    title?: string; // NEW: Added title prop for tooltip
}) {
    return (
        <Link
            href={props.href}
            title={props.title} // NEW: Use the title prop here for native tooltip
            // Enhanced styling for individual navigation tabs
            // Adjusted text size from text-lg to text-base
            className={`
            flex items-center space-x-3 p-3 text-base font-medium rounded-xl 
            text-gray-700 dark:text-gray-300
            hover:bg-indigo-500 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white
            transition-all duration-200 ease-in-out transform hover:scale-105
            w-[90%] mx-auto my-1 shadow-md
            ${props.className ?? ''}
            `}
        >
            <Image
                src={props.icon_path}
                alt={props.tab_text}
                // Adjusting dark mode invert/sepia for better icon visibility
                className="dark:invert dark:opacity-80 flex-shrink-0" 
                width={28} // Slightly smaller icons for better visual balance
                height={28}
                priority
            />
            <p
                // Removed 'truncate' from here as text should now fit comfortably
                className={`flex-grow text-left m-0 p-0 ${
                    props.text_className ?? ''
                }`}
            >
                {props.tab_text}
            </p>
        </Link>
    );
}

// LinksColumn is an async function, which is how Server Components are defined.
// It fetches session data directly on the server.
export default async function LinksColumn(props: { className?: string }) {
    let username: string;
    
    const session = await auth().then(
        (session) => session
    );

    if (session == null) {
        username = 'NONE';
    } else {
        username = session.user?.name ?? 'UNAVAILABLE';
    }

    return (
        // Enhanced overall container for the sidebar
        <div
            className={`
            flex flex-col justify-between w-full h-full p-4 
            bg-white dark:bg-gray-800 
            rounded-2xl shadow-2xl 
            border border-gray-100 dark:border-gray-700
            ${props.className ?? ''}
        `}
        >
            {/* Top section: Logo and User/Auth tab */}
            <div className="flex flex-col items-center space-y-4">
                <div
                    className={`flex flex-row items-center justify-center w-full mb-4 px-2
                    ${props.className ?? ''}
                    `}
                >
                    {/* R2 Labs Logo */}
                    <Link
                        href={'http://r2-labs.io'}
                        className="flex-shrink-0 mr-4"
                    >
                        <Image
                            src={'/branding/new_r2_logo.svg'}
                            alt="RA Frontend Built by R2 Labs"
                            // className="dark:invert" // Consider keeping this if the logo needs to be white in dark mode
                            width={100}
                            height={100}
                            priority
                        />
                    </Link>
                    {/* User/Auth PageTab - more compact and styled */}
                    <PageTab
                        tab_text={username}
                        icon_path={'/icons/user.svg'}
                        href={
                            session == null ? '/auth/signin' : '/auth/signout'
                        }
                        // Added title for tooltip
                        title={session != null ? 'Logout' : 'Login / Register'}
                        // Custom styling for the user/auth button
                        // Adjusted to fixed width `w-[180px]` to accommodate 10+ characters
                        className="!w-[180px] !text-xs !py-1 !px-3 rounded-full border border-indigo-300 dark:border-purple-400 
                                  bg-indigo-50 dark:bg-gray-700 text-indigo-700 dark:text-purple-300
                                  hover:bg-indigo-100 dark:hover:bg-purple-700 hover:text-indigo-800 dark:hover:text-white
                                  transform hover:scale-105 transition-all duration-200 !shadow-none"
                        text_className="!text-xs !text-center !font-medium truncate" // Truncate still needed for longer usernames
                    />
                </div>

                {/* Authenticated Navigation Links */}
                {session != null ? (
                    <nav className="flex flex-col items-center w-full space-y-2">
                        <PageTab
                            tab_text={'Dashboard'}
                            icon_path={'/icons/dashboard-gauge.svg'}
                            href={'/dashboard'}
                        />
                        <PageTab
                            tab_text={'Application'}
                            icon_path={'/icons/application.svg'}
                            href={'/application_sandbox'}
                        />
                        <PageTab
                            tab_text={'Data Charts'}
                            icon_path={'/icons/data-chart.svg'}
                            href={'/charts'}
                        />
                        <PageTab
                            tab_text={'Training'}
                            icon_path={'/icons/dumbell.svg'}
                            href={'/training'}
                        />
                        <PageTab
                            tab_text={'Jogging'}
                            icon_path={'/icons/gears.svg'}
                            href={'/jog'}
                        />
                        <PageTab
                            tab_text={'Diagnostics'}
                            icon_path={'/icons/stethoscope.svg'}
                            href={'/diagnostics'}
                        />
                        <PageTab
                            tab_text={'IO Configuration'}
                            icon_path={'/icons/plc.svg'}
                            href={'/io_configuration'}
                        />
                        <PageTab
                            tab_text={'Administration'}
                            icon_path={'/icons/system-management.svg'}
                            href={'/administration'}
                        />
                    </nav>
                ) : (
                    // Render nothing or a placeholder when not authenticated
                    <></>
                )}
            </div>
            {/* You could add a footer here, e.g., version info or theme toggle */}
            {/* For now, StateReadout is rendered outside LinksColumn in layout.tsx */}
            {session != null ? <StateReadout /> : <></>}
        </div>
    );
}
