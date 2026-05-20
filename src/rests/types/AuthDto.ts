import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(50, { message: 'Username must be at most 50 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username may only contain letters, numbers, and underscores' })
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginDto {
  @IsString()
  @MinLength(1, { message: 'Username is required' })
  username: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(1, { message: 'Refresh token is required' })
  refreshToken: string;
}

export class LogoutDto {
  @IsString()
  @MinLength(1, { message: 'Refresh token is required' })
  refreshToken: string;
}
