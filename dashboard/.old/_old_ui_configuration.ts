import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating default component IDs
import { z } from 'zod'; // Import the Zod library for schema validation

/**
 * Step 1: Define individual metadata schemas for each component type.
 * This ensures each component's specific data is strictly validated.
 */

// Schema for the 'jogging' component's metadata
export const joggingMetadataSchema = z.object({
    message: z.string(),
    version: z.string(),
    pace: z.number().min(5, 'Pace must be at least 5 minutes per mile.'),
});

export const chartTraceMetadataSchema = z.array(
    z.object({
        table_name: z.string(),
        column: z.string(),
        color: z.string(),
    })
);

export type chartTraceMetadata = z.infer<typeof chartTraceMetadataSchema>;

export const PlotConfigurationSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.literal(['line', 'bar', 'scatter']),
    traces: chartTraceMetadataSchema,
    max_length: z.number().optional(),
});

export const PlotConfigurationsSchema = z.array(PlotConfigurationSchema);

export type PlotConfiguration = z.infer<typeof PlotConfigurationSchema>;

// Schema for the 'image' component's metadata
export const imageMetadataSchema = z.object({
    src: z.string().url('Image source must be a valid URL.'),
    altText: z.string().min(1, 'Alt text is required for accessibility.'),
    caption: z.string().optional(),
});

export const cameraMetadataSchema = z.object({
    source: z.string()
})

/**
 * Step 2: Create a union of all possible component schemas.
 * The 'discriminatedUnion' is key here; it tells Zod to look at the 'type' field
 * to determine which schema to use for validation.
 */

export const uiComponentSchemaBase = z.object({
    id: z.uuid(),
    label: z.string().min(1),
});

export const uiComponentSchema = z.discriminatedUnion('type', [
    uiComponentSchemaBase.extend({
        type: z.literal('jogging'),
        metadata: joggingMetadataSchema,
    }),
    uiComponentSchemaBase.extend({
        type: z.literal('charts'),
        metadata: PlotConfigurationSchema,
    }),
    uiComponentSchemaBase.extend({
        type: z.literal('image'),
        metadata: imageMetadataSchema,
    }),
    uiComponentSchemaBase.extend({
        type: z.literal('camera'),
        metadata: cameraMetadataSchema,
    }),
]);

export const uiConfigSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    layout: z.object({
        sidebarEnabled: z.boolean().default(true),
        headerHeight: z.number().min(50).max(200).default(80),
    }),
    components: z
        .array(uiComponentSchema)
        .min(1, 'At least one component is required.'),
    plots: PlotConfigurationsSchema,
    lastUpdated: z.string().datetime(),
});

// Define the TypeScript type from the schema for type safety
export type UiConfig = z.infer<typeof uiConfigSchema>;

export const uiConfigApiResponseSchema = z.object({
    client_id: z.string(),
    config_data: uiConfigSchema,
    last_updated: z.iso.datetime({ precision: 6 }),
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
    components: [
        // At least one component is required by .min(1)
        {
            id: uuidv4(), // Generate a unique ID for the default component
            type: 'jogging',
            label: 'Welcome Widget',
            metadata: {
                message:
                    'This is a default widget. Please save your configuration to customize.',
                version: '1.0.0',
                pace: 5,
            },
        },
    ],
    plots: [],
    lastUpdated: new Date().toISOString(), // Current timestamp in ISO format
};

/**
 * Step 5: Add a helper function to demonstrate usage.
 * Using .safeParse() is a best practice as it won't throw an error on failure.
 */

export const validateAndParseConfig = (data: unknown) => {
    const result = uiConfigSchema.safeParse(data);

    if (!result.success) {
        console.error('Validation failed:', result.error);
        return null;
    }

    return result.data;
};
