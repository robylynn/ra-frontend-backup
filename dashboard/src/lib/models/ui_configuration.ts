import { z } from 'zod'; // Import the Zod library for schema validation
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating default component IDs

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
                id: z.uuid(),
                type: z.string(),
                label: z.string().min(1, 'Component label cannot be empty.'),
                metadata: z.record(z.string(), z.any()).optional(), // A record for flexible key-value pairs
            })
        )
        .min(1, 'At least one component is required.'),
    lastUpdated: z.string().datetime(),
});

// Define the TypeScript type from the schema for type safety
export type UiConfig = z.infer<typeof uiConfigSchema>;

export const uiConfigApiResponseSchema = z.object({
    client_id: z.string(),
    config_data: uiConfigSchema,
    last_updated: z.iso.datetime({precision: 6}),
});

// Define the TypeScript type from the schema for type safety
export type UiConfigApiResponse = z.infer<typeof uiConfigApiResponseSchema>;

// Define a default configuration that matches your UiConfig schema
// This ensures a valid fallback structure even when the backend config is missing or fails to load.
export const DEFAULT_UI_CONFIG: UiConfig = {
    theme: 'system', // Default from schema
    layout: {
        sidebarEnabled: true, // Default from schema
        headerHeight: 80, // Default from schema, within min/max bounds
    },
    components: [ // At least one component is required by .min(1)
        {
            id: uuidv4(), // Generate a unique ID for the default component
            type: 'jogging',
            label: 'Welcome Widget',
            metadata: {
                message: 'This is a default widget. Please save your configuration to customize.',
                version: '1.0.0'
            },
        },
    ],
    lastUpdated: new Date().toISOString(), // Current timestamp in ISO format
};