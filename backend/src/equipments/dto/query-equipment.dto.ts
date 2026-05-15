import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryEquipmentDto {
    @IsOptional()
    @IsString()
    site?: string;

    @IsOptional()
    @IsString()
    grade?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['days_since_check', 'grade', 'point_value', 'equipment'])
    sort?: string = 'days_since_check';

    @IsOptional()
    @IsIn(['asc', 'desc'])
    order?: 'asc' | 'desc' = 'desc';

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