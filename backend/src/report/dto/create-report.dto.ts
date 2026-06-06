import { IsString, IsNumber, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  envelopedFftId: string; 

  @IsString()
  @IsOptional()
  kks?: string;

  @IsString()
  @IsOptional()
  equipmentName?: string;

  @IsNumber()
  @IsOptional()
  rpm?: number;

  @IsArray()
  @IsOptional()
  bearings?: any[]; 

  @IsString()
  @IsOptional()
  findings?: string;

  @IsString()
  @IsOptional()
  recommendations?: string;
}