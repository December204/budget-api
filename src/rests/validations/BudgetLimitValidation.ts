import { z } from 'zod';

export const UpsertBudgetLimitSchema = z.object({
  categoryId: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  limitAmount: z.number().positive(),
});

export const BudgetLimitQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export type UpsertBudgetLimitDto = z.infer<typeof UpsertBudgetLimitSchema>;
export type BudgetLimitQueryDto = z.infer<typeof BudgetLimitQuerySchema>;
