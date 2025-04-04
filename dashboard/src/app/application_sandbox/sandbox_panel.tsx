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
            <p className="w-full text-center h-[50px] items-center justify-center align-middle">
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

    const [endpointValues, setEndpointValues] = useState<Array<string>>([
        null,
        null,
    ]);

    const setEndpoint = (endpoint_index: number, endpoint_value: string) => {
        const endpoint_payload = `${endpoint_index}|${endpoint_value}`;
        dashboardContext.application_services.set_endpoint(endpoint_payload, () =>
            setEndpointValues((v) => {
                let values = [...v];
                values[endpoint_index] = endpoint_value;
                return values;
            })
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
                <div className="grid grid-cols-[25%_25%_25%_25%] place-items-center">
                    {/* <IndicatorLight/> */}
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
                </div>
                <div className="grid grid-cols-2 place-items-center">
                    <LabeledInput
                        name={`Button 1 Endpoint: ${endpointValues[0] ?? 'Blank'}`}
                        callback={(value: string) =>
                            setEndpoint(0, `${value}`)
                        }
                        className="w-[75%]"
                    />
                    <LabeledInput
                        name={`Button 2 Endpoint: ${endpointValues[1] ?? 'Blank'}`}
                        callback={(value: string) =>
                            setEndpoint(1, `${value}`)
                        }
                        className="w-[75%]"
                    />
                </div>
                <div className="p-5">
                    <p>Callback Message</p>
                    <div className="bg-white rounded-sm border h-[100px] content-center">
                        <p className="text-center">
                            {dashboardContext.application_state.get_state(
                                'callback_payload'
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </DashboardHeaderContainer>
    );
}
