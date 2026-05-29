import {
  Controller, Get,
  Param, Query, ParseIntPipe,} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { QueryMeasurementDto } from './dto/query-measurement.dto';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly service: MeasurementsService) { }

  // GET /api/v1/measurements?site=xxx&grade=F,E&page=1&limit=20
  @Get()
  findAll(@Query() query: QueryMeasurementDto) {
    return this.service.findAll(query);
  }

  // GET /api/v1/measurements/debug-scores
  @Get('debug-scores')
  debugScores() {
    return this.service.debugScores();
  }

  // GET /api/v1/measurements/123
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}