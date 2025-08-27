import { z } from 'zod'; // Import the Zod library for schema validation

// Step 1: Define the Zod schema for the UI configuration.
// This schema strictly defines the shape, types, and constraints of our data.
export const uiConfigSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    layout: z.object({
        sidebarEnabled: z.boolean().default(true),
        headerHeight: z.number().min(50).max(200).default(80),
    }),
    components: z
        .array(
            z.object({
                id: z.string().uuid(),
                type: z.enum(['button', 'card', 'input']),
                label: z.string().min(1, 'Component label cannot be empty.'),
                metadata: z.record(z.string(), z.any()).optional(), // A record for flexible key-value pairs
            })
        )
        .min(1, 'At least one component is required.'),
    lastUpdated: z.string().datetime(),
});

// Define the TypeScript type from the schema for type safety
export type UiConfig = z.infer<typeof uiConfigSchema>;
