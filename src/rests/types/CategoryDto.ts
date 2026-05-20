import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { CategoryType } from '@Enums/CategoryType';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  color?: string;

  @IsEnum(CategoryType, { message: 'type must be income or expense' })
  type: CategoryType;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  color?: string;

  @IsEnum(CategoryType, { message: 'type must be income or expense' })
  @IsOptional()
  type?: CategoryType;
}
