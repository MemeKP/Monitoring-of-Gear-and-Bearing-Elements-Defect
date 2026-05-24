// src/measurements/measurements.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { QueryMeasurementDto } from './dto/query-measurement.dto';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly service: MeasurementsService) {}

  // GET /api/v1/measurements?site=xxx&grade=F,E&page=1&limit=20
  @Get()
  findAll(@Query() query: QueryMeasurementDto) {
    return this.service.findAll(query);
  }

  // GET /api/v1/measurements/123
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // // POST /api/v1/measurements
  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // create(@Body() dto: CreateMeasurementDto) {
  //   return this.service.create(dto);
  // }

  // // PATCH /api/v1/measurements/123
  // @Patch(':id')
  // update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: UpdateMeasurementDto,
  // ) {
  //   return this.service.update(id, dto);
  // }

  // // DELETE /api/v1/measurements/123
  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.service.remove(id);
  // }
}