import { SpinnerIcon } from '@/lib/components/server_components/svg/icons';

interface SliderToggleInterface {
    isActive: boolean;
    onClick: () => void;
}
export const SliderToggle = (props: SliderToggleInterface) => {
    return (
        <button
            onClick={props.onClick}
            type="button"
            className={`h-6 w-12 rounded-full p-0.5 transition-colors duration-200 relative flex items-center justify-center ${props.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
        >
            <div
                className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${props.isActive ? 'translate-x-3' : '-translate-x-3'}`}
            ></div>
        </button>
    );
};

interface LoadingButtonProps {
    type: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    isLoading: boolean;
    buttonText: string;
}

export const LoadingButton = (props: LoadingButtonProps) => {
    return (
        <button
            onClick={props.onClick ?? undefined}
            type={props.type}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
        >
            {props.isLoading ? <SpinnerIcon /> : props.buttonText}
            {/* {props.buttonText} */}
        </button>
    );
};
