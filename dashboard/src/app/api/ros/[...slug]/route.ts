// Frontend Web Application for RA Products
// Developed by R2 Labs

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/reusable_models/api_models";
import { request, RequestOptions } from "http";

async function validateAuthentication(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return false;
  }
  return true;
}

async function proxyBackendRequest(params: {
  request: NextRequest;
  slug: string[];
}) {
  let payload = null;
  try {
    payload = await params.request.json().then((res) => res);
  }
  catch (e) {}

  let query_params = params.request.nextUrl.searchParams;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 1000);

  let backend_path = "http://" + process.env.CONTROLLER_URI + `/${params.slug.join("/")}`;
  if (query_params.size > 0)
    backend_path += ("?" + query_params.toString());

  let request_params: RequestInit = {
    method: params.request.method,
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
    cache: "no-store",
  }

  if (payload != null) {
    request_params.body = JSON.stringify(payload);
  }

  let res = await fetch(backend_path, request_params).then((res) => res.json());

  clearTimeout(timeoutId);

  return createAPIResponse({
    authenticated: true,
    data: res,
    error: false,
    error_string: "",
  });
}

function handleError(e: any, request: NextRequest, slug: string[]) {
  let error_name = (e as any).name;
  console.error(
    `${request.method} to backend ${slug.join(
      "/"
    )} failed due to ${error_name}.`
  );
  return createAPIResponse({
    authenticated: true,
    error_string: error_name,
  });
}

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { slug: string[] } }
// ) {
//   console.log(
//     `Received ${request.method} request to /ros/${params.slug.join("/")}`
//   );

//   if (!(await validateAuthentication())) {
//     return createAPIResponse({
//       authenticated: false,
//     });
//   }

//   try {
//     return proxyBackendRequest({ request: request, slug: params.slug });
//   } catch (e) {
//     return handleError(e, request, params.slug);
//   }
// }

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { slug: string[] } }
// ) {
//   console.log(
//     `Received ${request.method} request to /ros/${params.slug.join("/")}`
//   );

//   if (!(await validateAuthentication())) {
//     console.error(
//       `Unauthenicated ${request.method} request on /ros/${params.slug.join(
//         "/"
//       )}`
//     );
//     return createAPIResponse({
//       authenticated: false,
//     });
//   }

//   try {
//     return proxyBackendRequest({ request: request, slug: params.slug });
//   } catch (e) {
//     return handleError(e, request, params.slug);
//   }
// }

async function handler(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  console.log(
    `Received ${request.method} request to /ros/${params.slug.join("/")}`
  );

  if (!(await validateAuthentication())) {
    console.error(
      `Unauthenicated ${request.method} request on /ros/${params.slug.join(
        "/"
      )}`
    );
    return createAPIResponse({
      authenticated: false,
    });
  }

  try {
    return proxyBackendRequest({ request: request, slug: params.slug });
  } catch (e) {
    return handleError(e, request, params.slug);
  }
}

export {handler as GET, handler as POST}