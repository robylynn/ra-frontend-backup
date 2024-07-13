import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/models/api_models";

interface io_command_path_interface {
  params: {
    module: string;
    channel: string;
  };
}

export async function POST(
  request: NextRequest,
  path_params: io_command_path_interface,
) {
  console.log("posting IO");

  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  if (!request.nextUrl.searchParams.has("value")) {
    return createAPIResponse({
      authenticated: true,
      data: `Invalid IO command query for '${path_params.params.module}' channel '${path_params.params.channel}'`,
    });
  }

  const query_value = request.nextUrl.searchParams.get("value");

  let command_value: boolean | number;
  if (query_value == "true" || query_value == "false")
    command_value = JSON.parse(query_value);
  else command_value = parseInt(query_value as string);

  const controller_response = await fetch(
    "http://" +
      process.env.CONTROLLER_URI +
      `/io_points/${path_params.params.module}/${path_params.params.channel}`,
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
