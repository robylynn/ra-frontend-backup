import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { cookies } from 'next/headers'
// import { PassThrough } from 'stream';
//import { useRouter } from 'next/router'

// interface device_path_interface {
//     params: {
//       device_id: string;
//       //parameter: string;
//     };
// }

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
//     async function set_cookie() {
//         'use server'
//         cookies().set('device_id', "test_id");
//     }
//     //set_cookie();
//     //return NextResponse.redirect(new URL('/home', request.url))

//     let url = request.nextUrl.clone()
//   const hostname = url.pathname.startsWith("/ingest/static/") ? 'us-assets.i.posthog.com' : 'us.i.posthog.com'
//   const requestHeaders = new Headers(request.headers)
  
//   //const router = useRouter();
//   //   requestHeaders.set('host', hostname)

// //   url.protocol = 'https'
// //   url.hostname = hostname
// //   url.port = '443'
// //   url.pathname = url.pathname.replace(/^\/ingest/, '');
//     //if (router.)

//   if (url.pathname.endsWith("devices/1")) {
//     const response = NextResponse.rewrite("http://10.252.1.10");
//     response.cookies.set("device_id", "1", {maxAge: 5000});
    
//     // let str = new WritableStream();
//     // str.getWriter().write(`<h1>Error 410</h1>`)
//     // str.close;

//     // let str2 = new PassThrough();
//     // str2.write(`<h1>Error 410</h1>`)
//     // str2.write(response.body?.getReader().read());

//     // // let stream = new require('stream').Transform();
//     // // let b = response.body?.getReader().read();
//     // response.body = str2;
//     return response;

//     return new NextResponse(
//         `
//             <h1>Error 410</h1>
//             <h2>Permanently deleted or Gone</h2>
//             <p>This page is not found and is gone from this server forever</p>
//         `,
//         { status: 410, headers: { 'content-type': 'text/html' } }
//     )
    
//   } else if (url.pathname.endsWith("dashboard")) {
//     const response = NextResponse.next();
//     response.cookies.delete("device_id");
//     return response;
//   } else {
//     if (request.cookies.has("device_id")) {
//         // const response = NextResponse.redirect(url);
//         //const path = request.nextUrl
//         const response = NextResponse.rewrite(new URL(request.nextUrl.pathname, "http://10.252.1.10"));
//         // const response = NextResponse.next();
//         // response.cookies.delete("device_id");
//         return response;
//     } else {
//       const response = NextResponse.next();
//     }
    
//   }

// //   if (request.cookies.has("device_id")) {
// //     return NextResponse.rewrite(new URL(url.pathname, "http://10.252.1.10"))
// //   }
  

// //   return NextResponse.rewrite(url, {
// //     headers: requestHeaders,
// //   })
  return NextResponse.next();
}

export const config = {
    matcher: '/((?!/api/socket$).*)', // match all paths except /ws
  }