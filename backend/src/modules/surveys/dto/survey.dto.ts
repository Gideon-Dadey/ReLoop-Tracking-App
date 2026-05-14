import { IsArray, IsNotEmpty, IsString, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SurveyAnswerDto {
  @IsNumber()
  @Min(1)
  @Max(10)
  @ApiProperty({ example: 1 })
  questionId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  value: number;
}

export class SubmitSurveyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerDto)
  @IsNotEmpty()
  @ApiProperty({ type: [SurveyAnswerDto] })
  responses: SurveyAnswerDto[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1.0' })
  surveyVersion: string;
}
