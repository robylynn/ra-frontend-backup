// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { UIConfiguration } from "@/lib/reusable_models/api_models";
import { createAPIResponse } from "@/lib/reusable_models/api_models";

export async function GET(request: NextRequest) {
  // let client_id = null;
  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  // if (!request.nextUrl.searchParams.has("client_id")) {
  //     console.log(
  //         "No client ID prodivded for configuration request, getting new client ID",
  //     );
  //     client_id = "";
  // } else {
  //     client_id = JSON.parse(
  //         request.nextUrl.searchParams.get("client_id") ?? "-1",
  //     );
  // }

  const received_configuration = await fetch(
    "http://" +
      process.env.CONTROLLER_URI +
      `/ui/configuration?` +
      request.nextUrl.searchParams,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    },
  )
    .then((res) => res.json())
    .then((res) => res.payload)
    .catch((reason) => console.log("REASON: " + reason));

  const ui_configuration = new UIConfiguration(received_configuration);

  return createAPIResponse({
    authenticated: true,
    data: ui_configuration.serialize(),
  });
}
