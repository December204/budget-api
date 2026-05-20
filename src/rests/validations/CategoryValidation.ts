import { z } from 'zod';

import { CategoryType } from '@Enums/CategoryType';

export const CategoryQuerySchema = z.object({
  type: z.nativeEnum(CategoryType).optional(),
});

export type CategoryQueryDto = z.infer<typeof CategoryQuerySchema>;
