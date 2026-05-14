import { IsEmail, IsNotEmpty, IsEnum, IsOptional, MinLength, IsString, IsMongoId, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  @ApiProperty({ minLength: 6 })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty()
  userName: string;

  @IsEnum(UserRole)
  @IsOptional()
  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  role?: UserRole;

  @IsOptional()
  @IsMongoId()
  @ApiPropertyOptional()
  organizationId?: string;
}

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional()
  userName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500_000)
  @ApiPropertyOptional()
  avatar?: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  @ApiProperty({ minLength: 6 })
  newPassword: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  token: string;
}
