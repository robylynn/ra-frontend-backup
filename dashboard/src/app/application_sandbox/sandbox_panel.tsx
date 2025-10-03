// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { R2Button } from '@/lib/components/client_components/ClickButton';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import IndicatorLight from '@/lib/components/server_components/IndicatorLight';
import { Dispatch, SetStateAction, useContext, useState } from 'react';

const LabeledInput = (props: {
    name: string;
    callback: (value: string) => void;
    className?: string;
}) => {
    const [inputText, setInputText] = useState<string>();

    return (
        <div className={`flex flex-col ${props.className ?? ''}`}>
            <p className="w-full text-center h-[50px] items-center justify-center align-middle text-r2-white">
                {props.name}
            </p>
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <input
                    type="text"
                    onChange={(event) => setInputText(event.target.value)}
                    className="w-full"
                />
                <R2Button
                    text="Set"
                    onClick={() => props.callback(inputText)}
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default function SandboxPanel(props: {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
}) {
    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);

    const red_light_color = 'rgb(255,0,0,1)';
    const green_light_color = 'rgb(0,255,0,1)';
    const blue_light_color = 'rgb(0,0,255,1)';
    const orange_light_color = 'rgb(255,150,0,1)';
    const external_light_color = 'rgb(255,0,255,1)';

    const setApplicationState = (
        state_name: string,
        state_value: string | number
    ) => {
        dashboardContext.ros_services.application_services.set_state_variable(
            state_name,
            state_value
        );
    };

    return (
        <DashboardHeaderContainer
            header_text={'APPLICATION'}
            icon_path={'/icons/application.svg'}
            className={`${props.className ?? ''}`}
            fill_tile_id={props.id}
            fill_tile_callback={props.fill_tile_callback}
        >
            <div className="flex flex-col space-y-5">
                <div className="grid grid-cols-5 place-items-center">
                    <IndicatorLight
                        active={dashboardContext.digital_out_data?.values?.[3]}
                        on_color={green_light_color}
                    />
                    <IndicatorLight
                        active={dashboardContext.digital_out_data?.values?.[5]}
                        on_color={red_light_color}
                    />
                    <IndicatorLight
                        active={dashboardContext.digital_out_data?.values?.[6]}
                        on_color={blue_light_color}
                    />
                    <IndicatorLight
                        active={dashboardContext.digital_out_data?.values?.[4]}
                        on_color={orange_light_color}
                    />
                    <IndicatorLight
                        active={dashboardContext.digital_out_data?.values?.[7]}
                        on_color={external_light_color}
                    />
                </div>
                <div className="grid grid-cols-6 place-items-center">
                    <LabeledInput
                        name={`Selected Robot ID: ${dashboardContext.application_state.get_state('robot_id') ?? 'Blank'}`}
                        callback={(value: string) =>
                            setApplicationState('robot_id', `${value}`)
                        }
                        className="w-[75%]"
                    />
                    <LabeledInput
                        name={`Selected Destination Cell: ${dashboardContext.application_state.get_state('destination_cell') ?? 'Blank'}`}
                        callback={(value: string) =>
                            setApplicationState('destination_cell', `${value}`)
                        }
                        className="w-[75%]"
                    />
                    <R2Button
                        className="w-[40%] h-[80%]"
                        text={'Send Robot to Position'}
                        onClick={() => {
                            dashboardContext.ros_services.application_services.send_robot_command(
                                'GO_SOMEWHERE_TO_STAY'
                            );
                        }}
                    />
                    <R2Button
                        className="w-[40%] h-[80%]"
                        text={'Start Cycle'}
                        onClick={() => {
                            dashboardContext.ros_services.application_services.send_robot_command(
                                'OPEN'
                            );
                        }}
                    />
                    <R2Button
                        className="w-[40%] h-[80%]"
                        text={'Go Drop'}
                        onClick={() => {
                            dashboardContext.ros_services.application_services.send_robot_command(
                                'GO_DROP'
                            );
                        }}
                    />
                    <R2Button
                        className="w-[40%] h-[80%]"
                        text={'Cancel Cycle'}
                        onClick={() => {
                            dashboardContext.ros_services.application_services.send_robot_command(
                                'CANCEL'
                            );
                        }}
                    />
                </div>
                <div className="p-5 flex flex-col space-y-4">
                    <div className="space-y-2">
                        <p className="text-r2-white">Callback Message</p>
                        <div className="bg-white rounded-sm border h-[170px] content-center">
                            <p className="text-center">
                                {JSON.stringify(
                                    dashboardContext.application_state.get_state(
                                        'callback_payload'
                                    ),
                                    null,
                                    2
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-r2-white">RMS Response</p>
                        <div className="bg-white rounded-sm border h-[100px] content-center">
                            <p className="text-center">
                                {JSON.stringify(
                                    dashboardContext.application_state.get_state(
                                        'rms_response'
                                    ),
                                    null,
                                    2
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardHeaderContainer>
    );
}
