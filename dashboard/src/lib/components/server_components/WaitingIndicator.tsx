// Frontend Web Application for RA Products
// Developed by R2 Labs

export default function WaitingIndicator(props: {
    text: string;
    className?: string;
}) {
    return (
        <div
            className={`flex flex-row items-center h-full w-full justify-center content-center ${
                props.className ?? ''
            }`}
        >
            <p className="font-bold dark:text-r2-white animate-pulse">
                {props.text}
            </p>
        </div>
    );
}
