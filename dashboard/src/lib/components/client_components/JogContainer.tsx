// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { R2Button } from '@/lib/components/client_components/ClickButton';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import {
    IRosTypeR2CInterfacesAxisStateAxisIndex,
    IRosTypeR2CInterfacesJogAxisRequestConst,
} from '@/lib/models/ros_types';
import { ReactElement, useContext, useState } from 'react';

// TODO: jogging button for different distances, axis jog direction, add home, and reset

const JogButton = (props: {
    axis: number;
    amount: number;
    jog_mode: IRosTypeR2CInterfacesJogAxisRequestConst;
}): ReactElement => {
    const { dashboardContext } = useContext(DashboardContext);

    let button_text: string;
    let jog_mode: IRosTypeR2CInterfacesJogAxisRequestConst;

    if (props.amount > 0) {
        button_text = `Jog +${props.amount}`;
        jog_mode = props.jog_mode;
    } else if (props.amount == 0) {
        button_text = `Jog Stop`;
        jog_mode = IRosTypeR2CInterfacesJogAxisRequestConst.JOG_STOP;
    } else {
        button_text = `Jog -${Math.abs(props.amount)}`;
        jog_mode = props.jog_mode;
    }

    return (
        <R2Button
            className="flex-grow"
            text={button_text}
            disabled={
                dashboardContext.axis_heartbeat?.[props.axis]?.axis_state
                    .state !=
                IRosTypeR2CInterfacesAxisStateAxisIndex.STATE_CLOSED_LOOP_CONTROL
            }
            onClick={() =>
                dashboardContext.axis_command_services.jog_axis(
                    props.axis,
                    jog_mode,
                    props.amount
                )
            }
        />
    );
};

const JogAxis = (props: { axis: number }): ReactElement => {
    const [posVelSelectState, setPosVelSelectState] =
        useState<IRosTypeR2CInterfacesJogAxisRequestConst>(
            IRosTypeR2CInterfacesJogAxisRequestConst.JOG_VELOCITY
        );

    return (
        <div className="flex flex-col">
            <h2 className="flex flex-col items-center justify-center text-white">
                Axis {props.axis}
            </h2>
            <div className="flex w-full grid grid-cols-6 items-center justify-center p-4 gap-4">
                <select
                    onChange={
                        (e) =>
                            setPosVelSelectState(
                                parseInt(e.target.value)
                            )
                    }
                    value={posVelSelectState}
                >
                    <option
                        key={
                            IRosTypeR2CInterfacesJogAxisRequestConst.JOG_POSITION
                        }
                        value={
                            IRosTypeR2CInterfacesJogAxisRequestConst.JOG_POSITION
                        }
                    >
                        Position
                    </option>
                    <option
                        key={
                            IRosTypeR2CInterfacesJogAxisRequestConst.JOG_VELOCITY
                        }
                        value={
                            IRosTypeR2CInterfacesJogAxisRequestConst.JOG_VELOCITY
                        }
                    >
                        Velocity
                    </option>
                </select>
                <JogButton
                    axis={props.axis}
                    amount={-2}
                    jog_mode={posVelSelectState}
                />
                <JogButton
                    axis={props.axis}
                    amount={-0.25}
                    jog_mode={posVelSelectState}
                />
                {/* <div className="flex flex-col items-center justify-center text-white"></div> */}
                <JogButton
                    axis={props.axis}
                    amount={0}
                    jog_mode={posVelSelectState}
                />
                <JogButton
                    axis={props.axis}
                    amount={0.25}
                    jog_mode={posVelSelectState}
                />
                <JogButton
                    axis={props.axis}
                    amount={2}
                    jog_mode={posVelSelectState}
                />
            </div>
        </div>
    );
};

const JogContainer = () => {
    return (
        <div className="flex flex-col w-full items-center justify-center h-full">
            <JogAxis axis={0} />
            <JogAxis axis={1} />
            <JogAxis axis={2} />
            <JogAxis axis={3} />
        </div>
    );
};

export default JogContainer;
