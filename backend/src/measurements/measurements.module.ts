import { Module, OnModuleInit } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { MeasurementsController } from './measurements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measurement } from './entities/measurement.entity';
import { SpectrumCacheService } from 'src/helpers/spectrum-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Measurement])
  ],
  controllers: [MeasurementsController],
  providers: [MeasurementsService,
    SpectrumCacheService
  ],
  exports: [MeasurementsService, SpectrumCacheService]
})
//export class MeasurementsModule {}
export class MeasurementsModule implements OnModuleInit{
  constructor(private readonly spectrumCache: SpectrumCacheService) {}

  async onModuleInit() {
    await this.spectrumCache.warmUp();
    console.log('Spectrum cache warmed up');
  }
}
