// Frontend Web Application for RA Products
// Developed by R2 Labs

import Image from 'next/image';

export default function UnauthenticatedIndicator(props: {
    className?: string;
}) {
    return (
        <div
            className={`flex flex-row items-center h-full w-full justify-center content-center ${
                props.className ?? ''
            }`}
        >
            <p className="p-0 px-5 py-0 m-0 text-lg font-bold dark:text-r2-white">
                UNAUTHENTICATED
            </p>
            <Image
                src={'/icons/lock.svg'}
                alt="No server session..."
                className="fill-r2-white stroke-[5px]"
                width={50}
                height={50}
                priority
            />
        </div>
    );
}
