import { IsArray, IsNotEmpty, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../transactions/schemas/transaction.schema';

export class ScanEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userEmail: string;

  @IsEnum(TransactionType)
  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  timestamp: string; // ISO format
}

export class SyncBulkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScanEventDto)
  @ApiProperty({ type: [ScanEventDto] })
  events: ScanEventDto[];
}
