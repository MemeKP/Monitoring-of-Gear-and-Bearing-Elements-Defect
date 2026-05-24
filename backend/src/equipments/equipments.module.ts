import { Module } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { EquipmentsController } from './equipments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measurement } from 'src/measurements/entities/measurement.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from 'src/redis/redis.module';
import { EquipmentCacheWorker } from './equipment-cache.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([Measurement]),
    // ScheduleModule.forRoot(),
    // RedisModule,

],
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
  exports: [EquipmentsService]
})
export class EquipmentsModule {} 
