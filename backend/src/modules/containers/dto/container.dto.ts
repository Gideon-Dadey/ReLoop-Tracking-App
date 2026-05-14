import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IssueContainerDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: 'RE-001' })
  serialNumber: string;

  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  userEmail: string;
}

export class ReturnContainerDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: 'RE-001' })
  serialNumber: string;

  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  userEmail: string;
}

export class VerifyContainerDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: 'RE-001' })
  serialNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Base64 encoded image' })
  image: string;
}

export class SeedContainerDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: 'RE-001' })
  serialNumber: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: 'Coffee Cup' })
  type: string;
}
