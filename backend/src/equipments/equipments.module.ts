import { Module } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { EquipmentsController } from './equipments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measurement } from 'src/measurements/entities/measurement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Measurement])],
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
  exports: [EquipmentsService]
})
export class EquipmentsModule {} 
