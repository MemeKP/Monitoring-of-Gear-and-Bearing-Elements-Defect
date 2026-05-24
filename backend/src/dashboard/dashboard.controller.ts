import { Controller, Get, Param, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class DashboardStatsQuery {
  @IsOptional() @IsString() site?: string;
}

class DashboardAttentionQuery {
  @IsOptional() @IsString() site?: string;
  @IsOptional() @IsString() filter?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?:  number = 1;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit?: number = 20;
}

class DashboardOverdueQuery {
  @IsOptional() @IsString() site?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) threshold_days?: number = 90;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(50) limit?: number = 8;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?:  number = 1;
  @IsOptional() @IsString() filter?: string;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // GET /api/v1/dashboard/stats?site=all
  @Get('stats')
  getStats(@Query() q: DashboardStatsQuery) {
    return this.dashboardService.getStats(q.site);
  }

  // GET /api/v1/dashboard/attention?site=all&filter=critical&page=1&limit=20
  @Get('attention')
  getAttention(@Query() q: DashboardAttentionQuery) {
    return this.dashboardService.getAttention(q.site, q.filter, q.page, q.limit);
  }

  // GET /api/v1/dashboard/overdue?site=all&threshold_days=90&limit=8
  @Get('overdue')
  getOverdue(@Query() q: DashboardOverdueQuery) {
    return this.dashboardService.getOverdue(q.site, q.threshold_days, q.page,q.limit, q.filter);
  }

  @Get()
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }
}
