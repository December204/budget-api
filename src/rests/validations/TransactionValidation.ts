import { z } from 'zod';

import { TransactionType } from '@Enums/TransactionType';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const CreateTransactionSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  amount: z.number().positive(),
  type: z.nativeEnum(TransactionType),
  description: z.string().max(500).optional(),
  note: z.string().max(1000).optional(),
  date: dateString,
});

export const UpdateTransactionSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  amount: z.number().positive().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  description: z.string().max(500).optional(),
  note: z.string().max(1000).optional(),
  date: dateString.optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });

export const TransactionQuerySchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  dateFrom: dateString.optional(),
  dateTo: dateString.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortDir: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
export type TransactionQueryDto = z.infer<typeof TransactionQuerySchema>;
