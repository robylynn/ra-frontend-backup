// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/reusable_models/api_models";

interface alarm_global_command_interface {
  params: {
    component: string;
    parameter: string;
  };
}

export async function POST(
  request: NextRequest,
  path_params: alarm_global_command_interface,
) {
  console.log("posting global safety command");

  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  let enable_flag: boolean;
  try {
    enable_flag = JSON.parse(
      request.nextUrl.searchParams.get("enable")?.toLowerCase() ?? "false",
    );
  } catch (e) {
    return NextResponse.json({
      response_string: "Invalid global alarm override query",
    });
  }

  if (
    path_params.params.component == "global" &&
    path_params.params.parameter == "override"
  ) {
    const controller_response = await fetch(
      "http://" + process.env.CONTROLLER_URI + `/system/alarms/global/override`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command_data: {
            value: enable_flag,
          },
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
      data: "Invalid global alarm override",
    });
  }
}
