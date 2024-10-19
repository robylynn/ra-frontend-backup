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
