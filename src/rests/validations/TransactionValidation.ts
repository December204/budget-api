import { z } from 'zod';

import { TransactionType } from '@Enums/TransactionType';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const TransactionQuerySchema = z.object({
  type: z
    .nativeEnum(TransactionType)
    .optional(),
  categoryId: z.coerce
    .number()
    .int()
    .positive()
    .optional(),
  dateFrom: dateString.optional(),
  dateTo: dateString.optional(),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
  sortBy: z
    .enum(['date', 'amount', 'createdAt'])
    .default('date'),
  sortDir: z
    .enum(['ASC', 'DESC'])
    .default('DESC'),
});

export type TransactionQueryDto = z.infer<typeof TransactionQuerySchema>;
