import authOptions from '@/lib/auth/auth_options';
import { createAPIResponse } from '@/lib/models/api_models';
import { debug_mode } from '@/lib/utils/utilities';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: { camera: string } } // ← Changed to match folder name
) {
    // Authentication check (similar to your socket route)
    const session = await getServerSession(authOptions);

    if (session == null && process.env.ENABLE_AUTHENTICATION === 'true') {
        if (debug_mode())
            console.log(
                `Attempted camera stream access without authentication`
            );
        return createAPIResponse({
            backend_response: null,
            authenticated: false,
        });
    }

    try {
        // Get the camera ID from params
        const cameraId = params.camera;

        // Hard-code the video_feed path since this only handles camera IDs
        const targetUrl = `http://${process.env.ROS_HOST}:5000/video_feed/${cameraId}`;

        if (debug_mode()) {
            console.log(`Proxying camera request to: ${targetUrl}`);
        }

        // Fetch from internal camera server
        const response = await fetch(targetUrl, {
            headers: {
                Accept: 'image/jpeg, image/png, image/*',
            },
        });

        if (!response.ok) {
            if (debug_mode()) {
                console.log(
                    `Camera stream error: ${response.status} ${response.statusText}`
                );
            }
            return new NextResponse('Camera stream not available', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' },
            });
        }

        const contentType =
            response.headers.get('Content-Type') || 'image/jpeg';

        return new NextResponse(response.body, {
            status: response.status,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
                // CORS headers if needed
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
            },
        });
    } catch (error) {
        if (debug_mode()) {
            console.error('Camera proxy error:', error);
        }
        return new NextResponse('Camera service unavailable', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
