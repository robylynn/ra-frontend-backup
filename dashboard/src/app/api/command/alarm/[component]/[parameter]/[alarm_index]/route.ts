// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/models/api_models";

interface alarm_command_interface {
  params: {
    component: string;
    parameter: string;
    alarm_index: string;
  };
}

export async function POST(
  request: NextRequest,
  path_params: alarm_command_interface,
) {
  console.log("posting safety command");

  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  const query_params = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );

  if ("enable" in query_params || "override" in query_params) {
    const query = new URLSearchParams();
    if ("enable" in query_params)
      query.append(
        "enable",
        JSON.parse(query_params["enable"]).toString() == "true"
          ? (1).toString()
          : (0).toString(),
      );
    if ("override" in query_params)
      query.append(
        "override",
        JSON.parse(query_params["override"]).toString() == "true"
          ? (1).toString()
          : (0).toString(),
      );

    const controller_response = await fetch(
      "http://" +
        process.env.CONTROLLER_URI +
        `/system/alarms/${path_params.params.component}/${path_params.params.parameter}/${path_params.params.alarm_index}?` +
        query,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command_type: "alarm",
        }),
      },
    ).then((res) => res.json());

    return createAPIResponse({
      authenticated: true,
      data: controller_response,
    });
  } else {
    return createAPIResponse({
      authenticated: true,
      data: "Invalid alarm command",
    });
  }
}
