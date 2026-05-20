import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(100, { message: 'Name must be at most 100 characters' })
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password?: string;
}
