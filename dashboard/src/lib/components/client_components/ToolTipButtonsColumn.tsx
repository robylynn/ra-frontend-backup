import { SpinnerIcon } from '@/lib/components/server_components/svg/icons';

export interface ToolTipButtonProps {
    svgIcon: () => React.JSX.Element;
    bgColor?: string;
    onHoverBgColor?: string;
    isLoading: boolean;
    onClick?: () => void;
    text?: string;
    tooltipText?: string;
}

interface ButtonsColumnProps {
    buttons: ToolTipButtonProps[];
}

const ToolTipButton: React.FC<ToolTipButtonProps> = ({
    svgIcon,
    bgColor = 'bg-gray-600',
    onHoverBgColor = 'bg-gray-700',
    isLoading,
    onClick,
    text,
    tooltipText,
}) => {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                // disabled={isSaving || isLoading}
                className={`flex items-center gap-2 px-4 py-2 ${bgColor} text-white font-bold rounded-lg shadow hover:${onHoverBgColor} transition-colors`}
            >
                {isLoading ? <SpinnerIcon /> : svgIcon()} {text ?? null}
            </button>
            {/* The tooltip itself */}
            {tooltipText ? (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {tooltipText}
                    </div>
                    {/* A small triangle for the tooltip's arrow */}
                    <svg
                        className="absolute text-gray-800 h-2 w-full left-0 top-full"
                        x="0px"
                        y="0px"
                        viewBox="0 0 255 255"
                        fill="currentColor"
                    >
                        <polygon points="0,0 127.5,127.5 255,0" />
                    </svg>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};

export const ButtonsColumn: React.FC<ButtonsColumnProps> = ({ buttons }) => {
    return (
        <div className="w-full max-w-7xl flex flex-col items-center h-full py-10">
            <div className="flex flex-col h-full justify-between items-center">
                {buttons.map((button) => (
                    <ToolTipButton {...button} />
                ))}
            </div>
        </div>
    );
};
