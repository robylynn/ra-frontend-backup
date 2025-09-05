// zod_template.jinja
import { z } from "zod";


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
    modules: z.array(ioModule)
});
export type ioRackType = z.infer<typeof ioRack>;

export const ioConfiguration = z.array(ioRack);

export type ioConfigurationType = z.infer<typeof ioConfiguration>;
