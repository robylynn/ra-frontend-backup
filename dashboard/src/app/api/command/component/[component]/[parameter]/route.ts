// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/models/api_models";

interface component_command_path_interface {
  params: {
    component: string;
    parameter: string;
  };
}

export async function POST(
  request: NextRequest,
  path_params: component_command_path_interface,
) {
  console.log("posting component command");

  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  if (!request.nextUrl.searchParams.has("value")) {
    return NextResponse.json({
      response_string: `Invalid component command query for '${path_params.params.component}' parameter '${path_params.params.parameter}'`,
    });
  }

  const query_value = request.nextUrl.searchParams.get("value");

  let command_value: boolean | number;
  if (query_value == "true" || query_value == "false")
    command_value = JSON.parse(query_value);
  else command_value = parseFloat(query_value as string);

  const controller_response = await fetch(
    "http://" +
      process.env.CONTROLLER_URI +
      `/components/${path_params.params.component}/${path_params.params.parameter}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command_data: {
          value: command_value,
        },
      }),
    },
  ).then((res) => res.json());

  return createAPIResponse({
    authenticated: true,
    data: controller_response,
  });
}
