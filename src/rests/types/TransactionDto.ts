import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Matches, MaxLength } from 'class-validator';

import { TransactionType } from '@Enums/TransactionType';

export class CreateTransactionDto {
  @IsInt({ message: 'categoryId must be an integer' })
  @IsPositive({ message: 'categoryId must be positive' })
  @IsOptional()
  categoryId?: number;

  @IsNumber({}, { message: 'amount must be a number' })
  @IsPositive({ message: 'amount must be positive' })
  amount: number;

  @IsEnum(TransactionType, { message: 'type must be income or expense' })
  type: TransactionType;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  note?: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;
}

export class UpdateTransactionDto {
  @IsInt({ message: 'categoryId must be an integer' })
  @IsPositive({ message: 'categoryId must be positive' })
  @IsOptional()
  categoryId?: number;

  @IsNumber({}, { message: 'amount must be a number' })
  @IsPositive({ message: 'amount must be positive' })
  @IsOptional()
  amount?: number;

  @IsEnum(TransactionType, { message: 'type must be income or expense' })
  @IsOptional()
  type?: TransactionType;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  note?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date?: string;
}
