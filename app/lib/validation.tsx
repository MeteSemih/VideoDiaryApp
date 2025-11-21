
import { z } from 'zod';
export const videoMetadataSchema = z.object({
    name: z.string()
    .min(1,{message:"Video name is required"})
    .max(100,{message:"Video name must be less than 100 characters"}),

    description: z.string()
    .max(500,{message:"Description can be a maximum of 500 characters"})
    .optional(),
   
})
export type VideoMetadata = z.infer<typeof videoMetadataSchema>;