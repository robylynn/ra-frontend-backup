// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, useEffect, useState } from "react";

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
  const [configurationUpdateCounter, setConfigurationUpdateCounter] =
    useState(0);
  const { dashboardContext: context, setContext } = useContext(DashboardContext);

  // const fetcher= async (path: string) : Promise<any> => {
  // async function fetcher<Type>(path: string, timeout: number): Promise<Type> {
  //   const controller = new AbortController();
  //   const timeoutId = setTimeout(() => {
  //     controller.abort("Timeout");
  //   }, timeout);

  //   let request_params: RequestInit = {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //     signal: controller.signal,
  //     cache: "no-store",
  //   };

  //   let ret: any;
  //   try {
  //     const fetch_response: NextAPIResponseInterface = await fetch(
  //       path,
  //       request_params
  //     ).then((res) => res.json());

  //     if (!fetch_response.authenticated) {
  //       console.log(`Attempted unauthenticated fetch to ${path}`);
  //       ret = null;
  //     }

  //     ret = fetch_response.data.data;
  //   } catch (e) {
  //     console.log(`fetcher error getting ${path}: ` + e);

  //     ret = null;
  //   }

  //   clearTimeout(timeoutId);
  //   return ret;
  // }

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

    fetch_ui_configuration();
  // }, [configurationUpdateCounter]);
  }, []);

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
        return { ...c, heartbeat: heartbeat_valid };
      });
    };

    heartbeat();
  }, [updateCounter]);

  return <></>;
}
