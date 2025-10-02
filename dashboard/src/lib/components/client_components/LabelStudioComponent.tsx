"use client"

export function LabelStudioComponent() {
    return (
        <iframe
            className="h-full w-full"
            // src={'http://localhost:8080'}
            // src={'/labelstudio'}
            src={`http://${window.location.hostname}:8080`}
            // title={title}
            // width="100%"
            // height="100%"
            style={{ border: 'none' }} // Remove the default frame border
            // Sandbox is highly recommended for security if the content is untrusted
            // sandbox="allow-scripts allow-same-origin allow-popups"
        />
    );
}