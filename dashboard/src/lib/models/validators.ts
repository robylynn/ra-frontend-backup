import { z, ZodError } from "zod";
import { WebsocketError } from "@/lib/models/errors";

function createWebsocketMessageSchema<T>(schema: z.ZodSchema<T>) {
    return z.object({
        type: z.string(),
        table: z.string(),
        data: schema.nullable(),
    });
}

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
