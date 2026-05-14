import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignPlatform } from '../schemas/campaign.schema';

export class CreateCampaignDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @ApiProperty({ example: 'Zero Waste Kitchen Challenge' })
  title: string;

  @IsEnum(CampaignPlatform)
  @ApiProperty({ enum: CampaignPlatform, example: CampaignPlatform.INSTAGRAM })
  platform: CampaignPlatform;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'https://www.instagram.com/p/example123' })
  url: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ example: 'A campaign promoting reusable containers in daily cooking' })
  description?: string;
}

export class EvaluateCampaignDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  visualDesignQuality: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  narrativeCoherence: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  circularEconomyAlignment: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({ minimum: 1, maximum: 5, example: 3 })
  behavioralCallToAction: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  communityOrientation: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiPropertyOptional({ example: 'Strong visual storytelling with clear call to action' })
  evaluatorNotes?: string;
}
