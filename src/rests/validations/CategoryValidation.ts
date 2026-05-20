import { z } from 'zod';

import { CategoryType } from '@Enums/CategoryType';

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  type: z.nativeEnum(CategoryType),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  type: z.nativeEnum(CategoryType).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });

export const CategoryQuerySchema = z.object({
  type: z.nativeEnum(CategoryType).optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type CategoryQueryDto = z.infer<typeof CategoryQuerySchema>;
