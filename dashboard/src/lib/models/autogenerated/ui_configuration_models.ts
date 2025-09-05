// zod_template.jinja
import { z } from "zod";


export const joggingMetadata = z.object({
    message: z.string(),
    version: z.string(),
    pace: z.any()
});
export type joggingMetadataType = z.infer<typeof joggingMetadata>;

export const chartTraceMetadata = z.object({
    table_name: z.string(),
    column: z.string(),
    color: z.string()
});
export type chartTraceMetadataType = z.infer<typeof chartTraceMetadata>;

export const plotConfiguration = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['line','bar','scatter']),
    traces: z.array(chartTraceMetadata),
    max_length: z.number()
});
export type plotConfigurationType = z.infer<typeof plotConfiguration>;

export const plotConfigurations = z.array(plotConfiguration);

export type plotConfigurationsType = z.infer<typeof plotConfigurations>;

export const imageMetadata = z.object({
    src: z.string().url(),
    altText: z.string().min(1),
    caption: z.string()
});
export type imageMetadataType = z.infer<typeof imageMetadata>;

export const cameraMetadata = z.object({
    source: z.string()
});
export type cameraMetadataType = z.infer<typeof cameraMetadata>;

export const joggingComponent = z.object({
    id: z.string().uuid(),
    label: z.string().min(1),
    type: z.any(),
    metadata: 
        joggingMetadata
});
export type joggingComponentType = z.infer<typeof joggingComponent>;

export const chartComponent = z.object({
    id: z.string().uuid(),
    label: z.string().min(1),
    type: z.any(),
    metadata: 
        plotConfiguration
});
export type chartComponentType = z.infer<typeof chartComponent>;

export const imageComponent = z.object({
    id: z.string().uuid(),
    label: z.string().min(1),
    type: z.any(),
    metadata: 
        imageMetadata
});
export type imageComponentType = z.infer<typeof imageComponent>;

export const cameraComponent = z.object({
    id: z.string().uuid(),
    label: z.string().min(1),
    type: z.any(),
    metadata: 
        cameraMetadata
});
export type cameraComponentType = z.infer<typeof cameraComponent>;

export const uiComponent = z.union([
    joggingComponent,
    chartComponent,
    imageComponent,
    cameraComponent,
    ]);
export type uiComponentType = z.infer<typeof uiComponent>;

export const uiConfig = z.object({
    theme: z.enum(['light','dark','system']),
    layout: z.object().optional(),
    components: z.array(uiComponent).min(1),
    plots: 
        plotConfigurations,
    lastUpdated: z.string().datetime()
});
export type uiConfigType = z.infer<typeof uiConfig>;

export const uiConfigApiResponse = z.object({
    client_id: z.string(),
    config_data: 
        uiConfig,
    last_updated: z.string().datetime()
});
export type uiConfigApiResponseType = z.infer<typeof uiConfigApiResponse>;
