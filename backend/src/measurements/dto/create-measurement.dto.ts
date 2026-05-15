import {
  IsString, IsOptional, IsNumber, IsDateString,
  IsArray, MaxLength,
} from 'class-validator';

export class CreateMeasurementDto {
  @IsString()
  @MaxLength(100)
  site: string;

  @IsString()
  @MaxLength(255)
  equipment: string;

  @IsString()
  @MaxLength(50)
  meas_point: string;

  @IsDateString()
  meas_date: string;

  @IsOptional()
  @IsString()
  meas_time?: string;

  @IsOptional()
  @IsString()
  amp_type?: string;

  @IsOptional()
  @IsNumber()
  df?: number;

  @IsOptional()
  @IsNumber()
  bpfo?: number;

  @IsOptional()
  @IsNumber()
  f0?: number;

  @IsOptional()
  @IsNumber()
  ibeta?: number;

  @IsOptional()
  @IsArray()
  enveloped_fft?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  detail_peak?: number[];

  @IsOptional()
  @IsNumber()
  opt_point_value?: number;

  @IsNumber()
  adj_opt_point_value: number;    // required — used for grading

  @IsOptional()
  @IsNumber()
  state?: number;

  @IsOptional()
  @IsArray()
  peak_data?: object[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  pic?: string;

  @IsOptional()
  @IsNumber()
  seq_id?: number;

  @IsOptional()
  @IsNumber()
  scales?: number;

  @IsOptional()
  @IsString()
  when_action?: string;
}