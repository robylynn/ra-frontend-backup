"use client";

import {
    Dispatch,
    ReactElement,
    SetStateAction,
    useContext,
    useEffect,
    useState,
  } from "react";

import DashboardContext from "@/lib/models/dashboard_context";
import { DashboardHeaderContainer } from "@/lib/components/client_components/dashboard_header_container";
import { ConnectedDeviceContainer } from "@/lib/reusable_components/server_components/connected_device_container";

// function ConnectedDeviceContainer(props: {
//   device_name: string,
//   ip: string
// }) {
//   return (
//     <div>
//     <p>{props.ip}</p>
//     <p>{props.device_name}</p>
//     </div>
//   )
// }

export default function DevicesContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
    const { context } = useContext(DashboardContext);
    const [expansionState, setExpansionState] = useState<boolean>(false);

    const connected_device_array = () => {
      let connected_devices: Array<ReactElement> = [];
      if (context.clients != undefined) {
        context.clients.forEach((client) => {
          connected_devices.push(
            <ConnectedDeviceContainer
              title={client.name}
              // ip={client}
              // device_name={'unknown'}
            >
              <p>IP Address: {client.IP}</p>
              <p>Customer: {client.customer}</p>
            </ConnectedDeviceContainer>
          )
        })
      } else {
        var i = 5;
      }
      return connected_devices;
    }

    return (
        <DashboardHeaderContainer
          header_text={"Devices"}
          icon_path={"/icons/device.svg"}
          className={`overflow-y-auto ${props.className ?? ""}`}
          fill_tile_id={props.id}
          fill_tile_callback={props.fill_tile_callback}
          expansion_state={expansionState}
          set_expansion_state={setExpansionState}
        >
          {connected_device_array()}
        </DashboardHeaderContainer>
    )

}
