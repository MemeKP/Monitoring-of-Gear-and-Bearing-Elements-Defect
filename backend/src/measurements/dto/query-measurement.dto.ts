import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMeasurementDto {
  @IsOptional()
  @IsString()
  site?: string;

  @IsOptional()
  @IsString()
  equipment?: string;

  @IsOptional()
  @IsString()
  meas_point?: string;

  @IsOptional()
  @IsString()
  from?: string;       // YYYY-MM-DD

  @IsOptional()
  @IsString()
  to?: string;         // YYYY-MM-DD

  @IsOptional()
  @IsString()
  grade?: string;      // e.g. "F,E" comma-separated

  @IsOptional()
  @IsString()
  amp_type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}