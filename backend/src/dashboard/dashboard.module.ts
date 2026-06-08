import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Measurement } from 'src/measurements/entities/measurement.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from 'src/equipments/entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Measurement, Equipment]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
