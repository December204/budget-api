import { IsInt, IsNumber, IsPositive, Max, Min } from 'class-validator';

export class UpsertBudgetLimitDto {
  @IsInt({ message: 'categoryId must be an integer' })
  @IsPositive({ message: 'categoryId must be positive' })
  categoryId: number;

  @IsInt({ message: 'month must be an integer' })
  @Min(1, { message: 'month must be between 1 and 12' })
  @Max(12, { message: 'month must be between 1 and 12' })
  month: number;

  @IsInt({ message: 'year must be an integer' })
  @Min(2000, { message: 'year must be >= 2000' })
  @Max(2100, { message: 'year must be <= 2100' })
  year: number;

  @IsNumber({}, { message: 'limitAmount must be a number' })
  @IsPositive({ message: 'limitAmount must be positive' })
  limitAmount: number;
}
