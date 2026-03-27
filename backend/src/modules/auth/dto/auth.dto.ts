import { IsEmail, IsNotEmpty, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @ApiProperty()
  userName: string;

  @IsEnum(UserRole)
  @IsOptional()
  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  role?: UserRole;

  @IsOptional()
  @ApiProperty({ required: false })
  organizationId?: string;
}

export class LoginDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
