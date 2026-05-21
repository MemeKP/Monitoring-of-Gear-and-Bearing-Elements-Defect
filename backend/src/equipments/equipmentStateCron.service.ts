// import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Measurement } from 'src/measurements/entities/measurement.entity';
// import { RedisService } from 'src/redis/redis.service';
// import { Repository } from 'typeorm';

// @Injectable()
// export class EquipmentStateCronService {
//   private readonly logger = new Logger(EquipmentStateCronService.name);

//   constructor(
//     @InjectRepository(Measurement)
//     private readonly repo: Repository<Measurement>,
//     private readonly redisService: RedisService,
//   ) {}

//   @Cron(CronExpression.EVERY_MINUTE)
//   async buildLatestStateCache() {
//     this.logger.log('Starting to build Latest State Cache...');

//     const fMotorCondition = `
//       (sub.detail_peak IS NOT NULL AND sub.detail_peak != '' AND
//       FLOOR(JSON_EXTRACT(sub.enveloped_fft, CONCAT('$[', SUBSTRING_INDEX(sub.detail_peak, ',', 1), '][0]'))) = 100)`;

//     const rawData = await this.repo.query(`
//       SELECT * FROM (
//         SELECT 
//           sub.id, sub.equipment, sub.site, sub.meas_point AS measPoint, sub.meas_date AS measDate, sub.state, sub.adj_opt_point_value AS pointValue,
//           CASE WHEN ${fMotorCondition} THEN true ELSE false END AS is_f_motor,
//           ROW_NUMBER() OVER(PARTITION BY sub.site, sub.equipment ORDER BY sub.meas_date DESC, sub.state DESC) as rn
//         FROM enveloped_fft sub
//         WHERE sub.indicator != 'I' AND sub.state IS NOT NULL
//       ) ranked
//       WHERE rn = 1
//     `);

//     await this.redisService.setJson('global:equipment_latest_state', rawData, 300);
    
//     this.logger.log(`Cache updated with ${rawData.length} equipments.`);
//   }
// }