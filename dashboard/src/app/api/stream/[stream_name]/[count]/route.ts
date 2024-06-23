// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { notFound } from "next/navigation";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import {
  createAPIResponse,
  BackendAPIResponse,
} from "@/lib/reusable_models/api_models";
import {
  getDatabaseDocuments,
  getDatabaseIOState,
  getDatabaseMessages,
} from "@/lib/utils/database_queries";
import {
  DatabaseDocumentArray,
  DatabaseIOState,
  DatabaseIOStateArray,
  DatabaseMessageArray,
} from "@/lib/reusable_models/database_models";

export async function GET(
  req: NextRequest,
  { params }: { params: { stream_name: string; count: string } }
) {
  if (!process.env.DISABLE_AUTHENTICATION) {
    const session = await getServerSession(authOptions);

    if (session == null) {
      console.log(
        `Attempted ${params.stream_name} stream access without authentication`
      );
      return createAPIResponse({
        data: null,
        authenticated: false,
      });
    }
  }
  

  let db_data:
    | DatabaseDocumentArray
    | DatabaseIOStateArray
    | DatabaseMessageArray;
  switch (params.stream_name) {
    case "data": {
      console.log("STREAMING DATA");
      //db_data = await getDatabaseDocuments(parseInt(params.count));
      db_data = await getBackendAPIResponse(
        `/stream/io_points?number_of_points=${parseInt(params.count)}`
      ).then((db_data) => new DatabaseDocumentArray(db_data));
      break;
    }
    case "messages": {
      console.log("STREAMING MESSAGES");
      //db_data = await getDatabaseMessages(parseInt(params.count));
      db_data = await getBackendAPIResponse(
        `/stream/messages?number_of_messages=${parseInt(params.count)}`
      ).then((db_data) => new DatabaseMessageArray(db_data));
      break;
    }
    case "io": {
      console.log("STREAMING IO");
      // db_data = await getDatabaseIOState(parseInt(params.count));
      try {
        let db_data_1 = await getBackendAPIResponse(
          `/streams/io_data?number_of_points=${parseInt(params.count)}`
        ).then((db_data) => db_data);

        db_data = await getBackendAPIResponse(
          `/streams/io_data?number_of_points=${parseInt(params.count)}`
        ).then((db_data) => new DatabaseIOStateArray(db_data));
      } catch (e) {
        return createAPIResponse({
          authenticated: true,
          error: true,
          data: undefined,
          error_string: (e as any).name
        });
      }
      

      break;
    }
    default: {
      return notFound();
    }
  }

  return createAPIResponse({
    data: db_data.serialize(),
    authenticated: true,
    error: false,
    error_string: ""
  });
}

async function getBackendAPIResponse(path: string) {
  // try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000);

    // let z = await fetch("http://" + process.env.CONTROLLER_URI + `/state/clients`, {
    //     method: "GET",
    //     //signal: controller.signal,
    //   }).then((res) => res.json());

    let res: BackendAPIResponse = await fetch(
      "http://" + process.env.CONTROLLER_URI + path,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        cache: "no-store",
      }
    ).then((res) => res.json());

    clearTimeout(timeoutId);

    return res.data;
    // return createAPIResponse({
    //   authenticated: true,
    //   data: {
    //     clients: data.data,
    //   },
    // });
  // } catch (e) {
  //   console.error(`Fetching ${path} failed`);
  //   if ((e as any).name === "AbortError")
  //     return createAPIResponse({
  //       authenticated: true,
  //       data: {
  //         error: "AbortError",
  //         heartbeat: false,
  //       },
  //     });
  //   else
  //     return createAPIResponse({
  //       authenticated: true,
  //       data: {
  //         error: (e as any).name,
  //         clients: [],
  //       },
  //     });
  // }
}
