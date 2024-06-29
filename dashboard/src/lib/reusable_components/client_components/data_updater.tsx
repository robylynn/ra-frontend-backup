// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { useContext, useEffect, useState } from "react";

import {
  NextAPIResponseInterface,
  UIConfiguration,
} from "@/lib/reusable_models/api_models";
import DashboardContext from "@/lib/reusable_models/dashboard_context";
import {
  DatabaseDocumentArray,
  DatabaseIOStateArray,
  DatabaseMessageArray,
} from "@/lib/reusable_models/database_models";

export default function DataUpdater(props: {
  update_period_seconds: number;
  configuration_update_period_seconds: number;
}) {
  const [updateCounter, setUpdateCounter] = useState(0);
  const [configurationUpdateCounter, setConfigurationUpdateCounter] =
    useState(0);
  const { context, setContext } = useContext(DashboardContext);

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
  //   const fetchData = async () => {
  //     const start_time = Date.now();
  //     const response: NextAPIResponseInterface = await fetch(
  //       "/api/stream/data/1",
  //     ).then((res) => res.json());

  //     if (!response.authenticated) console.log("UNAUTHENTICATED FOR DATA");
  //     else if (response.data == null) {
  //       console.error("Database offline in data stream");
  //       setContext((context) => {
  //         return { ...context, database_online: false };
  //       });
  //     } else {
  //       const end_time = Date.now();
  //       const received_documents = new DatabaseDocumentArray(response.data);
  //       const latest_document = received_documents.latest_document;

  //       console.log(
  //         "updating with id " +
  //           latest_document._id +
  //           ", took " +
  //           (end_time - start_time).toString(),
  //       );

  //       setContext((context) => {
  //         return {
  //           ...context,
  //           database_online: true,
  //           latest_document: latest_document,
  //         };
  //       });
  //     }
  //   };

  //   try {
  //     fetchData();
  //   } catch (e) {
  //     console.log("Data update error: " + e);
  //   }
  // }, [updateCounter]);

  // useEffect(() => {
  //   const fetchMessages = async () => {
  //     const response: NextAPIResponseInterface = await fetch(
  //       "/api/stream/messages/10",
  //     ).then((res) => res.json());

  //     if (!response.authenticated) {
  //       console.error("Unauthenticated for messages stream");
  //     } else if (response.data == null) {
  //       console.error("Database offline in messages stream");
  //       setContext((context) => {
  //         return { ...context, database_online: false };
  //       });
  //     } else {
  //       const received_documents = new DatabaseMessageArray(response.data);

  //       setContext((context) => {
  //         return {
  //           ...context,
  //           database_online: true,
  //           messages: received_documents,
  //         };
  //       });
  //     }
  //   };

  //   try {
  //     fetchMessages();
  //   } catch (e) {
  //     console.log("Messages update error: " + e);
  //   }
  // }, [updateCounter]);

  // useEffect(() => {
  //   const fetchIOState = async () => {
  //     const response: NextAPIResponseInterface = await fetch(
  //       "/api/stream/io/1",
  //       {
  //         cache: "no-store",
  //       },
  //     ).then((res) => res.json());

  //     if (!response.authenticated) {
  //       console.log("UNAUTHENTICATED FOR IO STREAM");
  //     } else if (response.data == null) {
  //       console.error("Database offline");
  //       setContext((context) => {
  //         return { ...context, database_online: false };
  //       });
  //     } else {
  //       const received_documents = new DatabaseIOStateArray(response.data);

  //       setContext((context) => {
  //         return {
  //           ...context,
  //           database_online: true,
  //           io_state: received_documents,
  //         };
  //       });
  //     }
  //   };

  //   try {
  //     fetchIOState();
  //   } catch (e) {
  //     console.log("IO state update error: " + e);
  //   }
  // }, [updateCounter]);

  useEffect(() => {
    const fetchIOData = async () => {
      const response: NextAPIResponseInterface = await fetch(
        // "/api/streams/io_data?number_of_points=" + 1
        "/api/stream/io/1"
      ).then((res) => res.json());

      if (!response.authenticated) {
        console.log("UNAUTHENTICATED FOR IO STREAM");
      } else if (response.data == null) {
        console.error("Database offline");
        setContext((context) => {
          return { ...context, database_online: false };
        });
      }
      else if (response.error) {
        console.log("Error getting IO state: " + response.error_string)
      
      } else {
        const received_documents = new DatabaseIOStateArray(response.data);

        setContext((context) => {
          return {
            ...context,
            database_online: true,
            io_state: received_documents,
          };
        });
      }
    };
  
    try {
      fetchIOData();
    } catch (e) {
      console.log("IO data update error: " + e);
    }

  // }, [updateCounter]);
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
    const fetchHeartbeat = async () => {
      const heartbeat_response = await fetch("/api/state/heartbeat").then(
        (res) => res.json()
      );

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
  // }, [updateCounter]);
  }, []);

  // useEffect(() => {
  //   const fetchClients = async () => {
  //     const clients_response: NextAPIResponseInterface = await fetch("/api/state/clients").then(
  //       (res) => res.json(),
  //     );

  //     setContext((c) => {
  //       return { ...c, clients: clients_response.data.clients };
  //     });
  //   };

  //   try {
  //     fetchClients();
  //   } catch (e) {
  //     console.log("Fetch clients error: " + e);
  //   }
  // }, [updateCounter]);

  return <></>;
}
