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

export default function DataUpdater(props: {
  update_period_seconds: number;
  configuration_update_period_seconds: number;
}) {
  const [updateCounter, setUpdateCounter] = useState(0);
  const [configurationUpdateCounter, setConfigurationUpdateCounter] =
    useState(0);
  const { context, setContext } = useContext(DashboardContext);

  // const fetcher= async (path: string) : Promise<any> => {
  async function fetcher<Type>(path: string, timeout: number) : Promise<Type> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
    
    let request_params: RequestInit = {
      method: 'GET',
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
    }

    let ret: any;
    try {
      const fetch_response: NextAPIResponseInterface = await fetch(path, request_params).then(
        (res) => res.json()
      );
      
      ret = fetch_response.data.data;
    } catch (e) {
      console.log("fetcher error: " + e)
      
      ret = null;
    }

    clearTimeout(timeoutId);
    return ret;
    
  }

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
    const fetchConfiguration = async () => {
      const ui_config_params = new URLSearchParams();
      if (context.configuration?.client_id != undefined) {
        ui_config_params.append(
          "client_id",
          context.configuration.client_id.toString()
        );
      } else {
        ui_config_params.append("client_id", "-1");
      }

      const response: NextAPIResponseInterface = await fetch(
        "/api/config?" + ui_config_params
      ).then((res) => res.json());

      if (response.authenticated) {
        const received_configuration = new UIConfiguration(response.data);

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
      } else {
        console.log("NOT AUTHENTICATED FOR CONFIG");
      }
    };

    try {
      fetchConfiguration();
    } catch (e) {
      console.log("UI configuration error " + e);
    }
  }, [configurationUpdateCounter]);

  useEffect(() => {
    const fetch_io_configuration = async () => {
      let config: HardwareConfigurationInterface;
      try {
        config = await fetcher<HardwareConfiguration>("/api/backend/ui/io_configuration", 750);
        if (config != undefined) {
          console.log("Got hardware configuration")
          setContext((c) => {
            c.hardware_configuration = new HardwareConfiguration(config);
            return c;
          })
        }
      } catch (e) {
        console.error("Error getting hardware configuration: " + e)
      }
    }

    fetch_io_configuration();
  }, [configurationUpdateCounter])

  useEffect(() => {
    const fetchHeartbeat = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 500);
      
      let request_params: RequestInit = {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        cache: "no-store",
      }

      const heartbeat_response = await fetch("/api/state/heartbeat", request_params).then(
        (res) => res.json()
      );

      clearTimeout(timeoutId);

      setContext((c) => {
        return { ...c, heartbeat: heartbeat_response.data.heartbeat };
      });
    };

    try {
      fetchHeartbeat();
    } catch (e) {
      console.log("Heartbeat error: " + e);
      setContext((c) => {
        return { ...c, heartbeat: false };
      });
    }
  }, [updateCounter]);
  // }, []);

  return <></>;
}
