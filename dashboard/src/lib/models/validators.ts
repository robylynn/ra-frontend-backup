import { z, ZodError } from "zod";
import { WebsocketError } from "@/lib/models/errors";

function createWebsocketMessageSchema<T>(schema: z.ZodSchema<T>) {
    return z.object({
        type: z.string(),
        table: z.string(),
        data: schema.nullable(),
    });
}

// const websocketResponse = z.object({
//         type: z.string(),
//         table: z.string(),
//         data: schema.nullable()
//         // backend_response: z.object({
//         //     success: z.boolean(),
//         //     message: z.string(),
//         //     // The 'data' field's schema is now dynamic.
//         //     data: schema.nullable(),
//         // }),
//         // backend_response: basicApiResponseSchema.extend({
//         //     data: schema.nullable(),
//         // }),
//         // proxy_error: z.boolean(),
//         // proxy_error_string: z.string(),
//     });
// type websocketResponseSchema<T> = z.infer<typeof createWebsocketMessageSchema<T>>;

export function validateWebsocketData<T = unknown>(
    rawData: any,
    schema: z.ZodSchema<T>
) {
    try {
        const websocketResponseSchema = createWebsocketMessageSchema(schema);
        const validatedResponse = websocketResponseSchema.parse(rawData);

        return validatedResponse;
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors = error.issues
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join('\n');
            throw new WebsocketError(`Validation Failed:\n${formattedErrors}`);
        } else if (error instanceof WebsocketError) {
            throw error;
        } else {
            throw new WebsocketError(
                `An unknown error occurred: ${error instanceof Error ? error.message : 'Unknown'}`
            );
        }
    }
}
