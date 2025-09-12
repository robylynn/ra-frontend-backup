// Frontend Web Application for RA Products
// Developed by R2 Labs

import Image from 'next/image';
// import { R2Button } from './ClickButton';
import { DashboardHeaderContainerProps } from '@/lib/models/dashboard_types';

// export function PagePanel(props: { className?: string; children?: ReactNode }) {
//     return (
//         <div
//             className={`
//         my-1
//         bg-light-box-background
//         dark:bg-r2-dark-background-500/[.85]
//         shadow-[2px_4px_35px_0px_#70727C]
//         rounded-lg
//         w-[100%]
//         border
//         border-r2-green-300

//         py-2
//         ${props.className ?? ''}
//         `}
//         >
//             {props.children}
//         </div>
//     );
// }

export function SimplifiedDashboardHeaderContainer({
    id,
    header_text,
    icon_path,
    className = '',
    isLoading = false,
    children,
}): React.ReactElement<DashboardHeaderContainerProps> {
    // let expansionState: boolean;
    // let setExpansionState: Dispatch<SetStateAction<boolean>>;
    // [expansionState, setExpansionState] = useState<boolean>(false);
    // if (
    //     !(props.expansion_state == undefined) &&
    //     !(props.set_expansion_state == undefined)
    // ) {
    //     expansionState = props.expansion_state as boolean;
    //     setExpansionState = props.set_expansion_state as Dispatch<
    //         SetStateAction<boolean>
    //     >;
    // }

    return (
        <div
            className={`flex flex-col rounded-xl mx-2 bg-r2-dark-background-300 h-full transition-all duration-200  ${
                className ?? ''
            }`}
            id={id}
        >
            <div className="flex flex-row items-center p-2 rounded-xl group justify-between">
                <div className="flex flex-row">
                    <Image
                        src={icon_path}
                        alt={header_text}
                        className="dark:invert"
                        width={20}
                        height={20}
                        priority
                    />
                    <p className="p-0 px-2 m-0 font-bold text-sm dark:text-white/[0.88] peer-checked/control:text-black">
                        {header_text}
                    </p>
                    {/* {props.fill_tile_callback != undefined ? (
                        <input
                            id="control_fullscreen"
                            type="checkbox"
                            className="peer/control"
                            onClick={() => {
                                props.fill_tile_callback?.(() =>
                                    !expansionState ? props.fill_tile_id : ''
                                );
                                setExpansionState(() => !expansionState);
                            }}
                        />
                    ) : (
                        <></>
                    )} */}
                </div>
                {/* {props.button_callback &&
                props.button_text &&
                props.button_active ? (
                    <R2Button
                        text={props.button_text}
                        onClick={props.button_callback}
                    />
                ) : (
                    <></>
                )} */}
            </div>
            <div className="relative h-full mx-2 mb-2 rounded-xl bg-r2-dark-background-400 overflow-hidden">
                <div className="h-full mx-2 mb-2 rounded-xl bg-r2-dark-background-400">
                    {/* <div className="h-full mx-2 mb-2 rounded-xl bg-r2-dark-background-400 overflow-y-scroll"></div> */}
                    {children}
                </div>

                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                        <div className="border-[8px] border-black/[0.3] border-t-[8px] border-t-white rounded-[50%] w-[60px] h-[60px] animate-spin"></div>
                    </div>
                )}

                {/* {props.errorMessage && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-600 bg-opacity-90 rounded-xl p-4">
                        <div className="text-white flex flex-col items-center gap-4">
                            <p className="text-sm text-center">
                                {props.errorMessage}
                            </p>
                            <button
                                className="bg-white text-red-600 px-3 py-1 rounded shadow hover:bg-gray-100 transition"
                                onClick={props.onClearError}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
}
