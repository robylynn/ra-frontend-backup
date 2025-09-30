export interface IOpcDataPoint {
    id: string;
    name: string;
    type: number;
    node_id: string;
    is_writable: boolean;
    children: IOpcDataPoint[];
}

export const opcDataPoint: z.ZodType<IOpcDataPoint> = z.lazy(() => z.object({
    id: z.string(),
    name: z.string(),
    type: z.number(),
    node_id: z.string(),
    is_writable: z.boolean(),
    children: z.array(opcDataPoint)
}));