import { z } from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
