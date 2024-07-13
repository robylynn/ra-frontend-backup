import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers'

// async function middledware (req: NextRequest) {
//     const url = req.nextUrl
  
//     if (url.pathname === "/purchase-now") {
//       // rewrite to the new purchase route
//       return NextResponse.rewrite(new URL("/purchase", url))
//     }
//   }
  
//   export default middleware

interface device_path_interface {
    params: {
      device_id: string;
      //parameter: string;
    };
}

export async function GET(
    request: NextRequest,
    path_params: device_path_interface,
) {
    const cookieStore = cookies();
    //const theme = cookieStore.get('device_id')
    let url = request.nextUrl;
    cookies().set('device_id', path_params.params.device_id);

    return (
        NextResponse.rewrite(new URL("http://10.252.1.10"))
    )
}