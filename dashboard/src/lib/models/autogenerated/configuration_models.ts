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
    id: z.string().uuid(),
    name: z.string(),
    type: z.enum(['line','bar','scatter']),
    traces: z.array(chartTraceMetadata),
    max_length: z.number()
});
export type plotConfigurationType = z.infer<typeof plotConfiguration>;

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

export const uiConfiguration = z.object({
    theme: z.enum(['light','dark','system']),
    components: z.array(uiComponent).min(1),
    plots: z.array(plotConfiguration),
    lastUpdated: z.string().datetime()
});
export type uiConfigurationType = z.infer<typeof uiConfiguration>;

export const ioPointDescription = z.object({
    label: z.string(),
    type: z.enum(['DI','DO','AI','AO'])
});
export type ioPointDescriptionType = z.infer<typeof ioPointDescription>;

export const ioPoint = z.object({
    id: z.string(),
    point_type: 
        ioPointDescription,
    point_value: z.union([
        z.number(),z.boolean()])
});
export type ioPointType = z.infer<typeof ioPoint>;

export const ioModuleDescription = z.object({
    name: z.string(),
    icon: z.string(),
    points: z.array(ioPointDescription)
});
export type ioModuleDescriptionType = z.infer<typeof ioModuleDescription>;

export const ioModule = z.object({
    id: z.string(),
    name: z.string(),
    type: 
        ioModuleDescription,
    points: z.array(ioPoint)
});
export type ioModuleType = z.infer<typeof ioModule>;

export const ioRackConfig = z.object({
    name: z.string(),
    address: z.string(),
    max_modules: z.any()
});
export type ioRackConfigType = z.infer<typeof ioRackConfig>;

export const ioRack = z.object({
    id: z.string(),
    modules: z.array(ioModule),
    rack_config: 
        ioRackConfig
});
export type ioRackType = z.infer<typeof ioRack>;

export const ioConfiguration = z.object({
    racks: z.array(ioRack),
    lastUpdated: z.string().datetime()
});
export type ioConfigurationType = z.infer<typeof ioConfiguration>;

export const fullConfiguration = z.object({
    client_id: z.string(),
    ui_configuration: 
        uiConfiguration,
    io_configuration: 
        ioConfiguration
});
export type fullConfigurationType = z.infer<typeof fullConfiguration>;
