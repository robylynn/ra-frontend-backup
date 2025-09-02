// Frontend Web Application for RA Products
// Developed by R2 Labs

export default function LoadingIndicator(props: {
    className?: string;
    text?: string;
}) {
    return (
        <div
            className={`flex flex-row items-center h-full w-full justify-center content-center ${
                props.className ?? ''
            }`}
        >
            <p className="font-bold dark:text-r2-white">
                {props.text ?? 'LOADING'}
            </p>
            <div className="border-[4px] border-black/[0.1] border-t-[4px] border-t-white rounded-[50%] w-[25px] h-[25px] animate-spin mx-[10px] my-[20px]"></div>
        </div>
    );
}
