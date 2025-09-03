import z from "zod";

export const IOPointSchema = z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['DI', 'DO', 'AI', 'AO']),
    value: z.union([z.boolean(), z.number()]),
});
export type IOPoint = z.infer<typeof IOPointSchema>;

export const IOModuleTypeSchema = z.object({
    name: z.string(),
    icon: z.string(),
    points: z.array(IOPointSchema.omit({id: true, value: true}))
    // points: z.array(
    //     z.object({
    //         label: z.string(),
    //         type: z.enum(['DI', 'DO', 'AI', 'AO']),
    //     })
    // ),
});
type IOModuleType = z.infer<typeof IOModuleTypeSchema>;

// const ModuleTypeDefinitionSchema = ModuleTypeSchema.extend({points: z.array(IOPointSchema.omit({id: true, value: true}))});
// type ModuleTypeDefinition = z.infer<typeof ModuleTypeDefinitionSchema>;

// interface ModuleType {
//     name: string;
//     icon: string;
//     points: Omit<IOPoint, 'id' | 'value'>[];
// }

export const IOModuleSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: IOModuleTypeSchema,
    points: z.array(IOPointSchema),
});
export type IOModule = z.infer<typeof IOModuleSchema>;

export const IORackConfigSchema = z.object({
    name: z.string(),
    address: z.string(),
    maxModules: z.number().int().min(1),
});
export type IORackConfig = z.infer<typeof IORackConfigSchema>;

export const IORackSchema = z.object({
    id: z.string(),
    modules: z.array(IOModuleSchema),
    rackConfig: IORackConfigSchema,
});
export type IORack = z.infer<typeof IORackSchema>;

export const IOConfigurationSchema = z.array(IORackSchema);
export type IOConfiguration = z.infer<typeof IOConfigurationSchema>;
// --- END ZOD SCHEMAS ---

// --- TYPESCRIPT INTERFACES ---
// interface IOPoint {
//     id: string;
//     label: string;
//     type: 'DI' | 'DO' | 'AI' | 'AO';
//     value: boolean | number;
// }

// interface Module {
//     id: string;
//     name: string;
//     type: ModuleType;
//     points: IOPoint[];
// }
// interface RackConfig {
//     name: string;
//     address: string;
//     maxModules: number;
// }
// interface Rack {
//     id: string;
//     modules: Module[];
//     rackConfig: RackConfig;
// }

// --- PREDEFINED MODULE TYPES ---
export const ioModuleTypes: IOModuleType[] = [
    {
        name: '4-Slot DIO',
        icon: 'DigitalIOIcon',
        points: [
            { label: 'DI-1', type: 'DI' },
            { label: 'DI-2', type: 'DI' },
            { label: 'DO-1', type: 'DO' },
            { label: 'DO-2', type: 'DO' },
        ],
    },
    {
        name: '8-Slot DI',
        icon: 'DigitalInIcon',
        points: [
            { label: 'DI-1', type: 'DI' },
            { label: 'DI-2', type: 'DI' },
            { label: 'DI-3', type: 'DI' },
            { label: 'DI-4', type: 'DI' },
            { label: 'DI-5', type: 'DI' },
            { label: 'DI-6', type: 'DI' },
            { label: 'DI-7', type: 'DI' },
            { label: 'DI-8', type: 'DI' },
        ],
    },
    {
        name: '4-Slot AIO',
        icon: 'AnalogIOIcon',
        points: [
            { label: 'AI-1', type: 'AI' },
            { label: 'AI-2', type: 'AI' },
            { label: 'AO-1', type: 'AO' },
            { label: 'AO-2', type: 'AO' },
        ],
    },
    {
        name: '2-Slot AI',
        icon: 'AnalogInIcon',
        points: [
            { label: 'AI-1', type: 'AI' },
            { label: 'AI-2', type: 'AI' },
        ],
    },
    {
        name: 'Temperature',
        icon: 'TempIcon',
        points: [
            { label: 'Temp-1', type: 'AI' },
            { label: 'Temp-2', type: 'AI' },
        ],
    },
    {
        name: 'H.S. Counter',
        icon: 'CounterIcon',
        points: [
            { label: 'Count-A', type: 'DI' },
            { label: 'Count-B', type: 'DI' },
        ],
    },
];
