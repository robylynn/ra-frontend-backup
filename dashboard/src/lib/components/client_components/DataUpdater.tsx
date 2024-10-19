// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, useEffect, useState, useMemo } from "react";
// import { Worker } from "worker_threads";
import {
  HardwareConfiguration,
  HardwareConfigurationInterface,
  NextAPIResponseInterface,
  UIConfiguration,
} from "@/lib/models/api_models";
import DashboardContext from "@/lib/models/dashboard_context";
import timeoutFetch from "@/lib/utils/timeoutFetch";

export default function DataUpdater(props: {
  update_period_seconds: number;
  configuration_update_period_seconds: number;
}) {
  const [updateCounter, setUpdateCounter] = useState(0);
  const [testUpdateCounter, setTestUpdateCounter] = useState(0);
  const [configurationUpdateCounter, setConfigurationUpdateCounter] =
    useState(0);
  const { dashboardContext: context, setContext } = useContext(DashboardContext);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setUpdateCounter((counter) => counter + 1);
    }, props.update_period_seconds * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setConfigurationUpdateCounter((counter) => counter + 1);
    }, props.configuration_update_period_seconds * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setTestUpdateCounter((counter) => counter + 1);
  //     console.log("test ionterval")
  //   }, 0.1 * 1000);
  //   return () => clearInterval(intervalId);
  // }, []);

  useEffect(() => {
    const fetch_ui_configuration = async () => {
      try {
        const ui_config_params = new URLSearchParams();
        if (context.configuration?.client_id != undefined) {
          ui_config_params.append(
            "client_id",
            context.configuration.client_id.toString()
          );
        } else {
          ui_config_params.append("client_id", "-1");
        }

        const response = await timeoutFetch<UIConfiguration>(
          "/api/backend/ui/configuration?" + ui_config_params,
          750
        );

        if (response != null) {
          const received_configuration = new UIConfiguration(response);

          if (
            received_configuration.configured &&
            received_configuration.client_id != undefined
          ) {
            console.log(
              "updating UI configuration for client id " +
                received_configuration.client_id
            );
            setContext((c) => {
              return { ...c, configuration: received_configuration };
            });
          }
        }
      } catch (e) {
        console.log("UI configuration error " + e);
      }
    };

    if (context.configuration.client_id == undefined)
      fetch_ui_configuration();
  }, [configurationUpdateCounter]);
  // }, []);

  useEffect(() => {
    const fetch_io_configuration = async () => {
      let config: HardwareConfigurationInterface;
      try {
        config = await timeoutFetch<HardwareConfiguration>(
          "/api/backend/ui/io_configuration",
          750
        );
        if (config != undefined) {
          console.log("Got hardware configuration");
          setContext((c) => {
            c.hardware_configuration = new HardwareConfiguration(config);
            return c;
          });
        }
      } catch (e) {
        console.error("Error getting hardware configuration: " + e);
      }
    };

    fetch_io_configuration();
  }, [configurationUpdateCounter]);

  const heartbeatWorker: Worker = useMemo(() => new Worker(new URL("@/lib/utils/heartbeatWorker.ts", import.meta.url)), []);

  useEffect(() => {
    const heartbeat = async () => {
      let heartbeat = await timeoutFetch<string>(
        "/api/backend/state/heartbeat",
        750
      );
      let heartbeat_valid = heartbeat == "ACK" ? true : false;

      if (!heartbeat_valid) {
        console.log("Error getting heartbeat");
      }

      setContext((c) => {
        return { ...c, heartbeat: heartbeat_valid, heartbeat_counter: c.heartbeat_counter + 1 };
      });
    };

    // heartbeat();
    heartbeatWorker.postMessage("heartbeat")
  }, [updateCounter]);
  // }, []);

  
  

  useEffect(() => {
    heartbeatWorker.onmessage = (m: MessageEvent<boolean>) => {
      setContext((c) => {
        return { ...c, heartbeat: m.data, heartbeat_counter: c.heartbeat_counter + 1 };
      });
    }
    // setContext((c) => {
    //   return { ...c, heartbeat: true, heartbeat_counter: c.heartbeat_counter + 1 };
    // })
  }, [])

  // useEffect(() => {
  //   console.log("Analog in data updated")
  // }, [context.analog_in_data?.values?.[0]])

  // useEffect(() => {
  //   console.log("hearbeat inc")
  // }, [context.heartbeat_counter])
  
  // let z: Worker = new Worker()
  // console.log("running updater")

  return <></>;
}
