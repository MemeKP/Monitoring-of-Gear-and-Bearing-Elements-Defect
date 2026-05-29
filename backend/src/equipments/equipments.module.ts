import { Module } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { EquipmentsController } from './equipments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measurement } from 'src/measurements/entities/measurement.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from 'src/redis/redis.module';
import { EquipmentCacheWorker } from './equipment-cache.worker';
import { SpectrumCacheService } from 'src/helpers/spectrum-cache.service';
import { MeasurementsModule } from 'src/measurements/measurements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Measurement]),
    // ScheduleModule.forRoot(),
    // RedisModule,
    MeasurementsModule,

],
  controllers: [EquipmentsController],
  providers: [EquipmentsService, SpectrumCacheService],
  exports: [EquipmentsService]
})
export class EquipmentsModule {} 
