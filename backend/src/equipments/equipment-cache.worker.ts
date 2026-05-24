import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { Measurement } from 'src/measurements/entities/measurement.entity';

const STATE_TO_GRADE: Record<number, string> = {
    1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F',
};
const GRADE_ORDER = ['F', 'E', 'D', 'C', 'B', 'A'];

@Injectable()
export class EquipmentCacheWorker {
    private readonly logger = new Logger(EquipmentCacheWorker.name);

    constructor(
        @InjectRepository(Measurement)
        private readonly repo: Repository<Measurement>,
        private readonly redisService: RedisService,
    ) { }

    // run app start 
    async onModuleInit() {
        const existing = await this.redisService.getJson<string[]>('equipment:index:all');

        if (existing?.length) {
            this.logger.log(`Cache exists (${existing.length} equipment), skip rebuild`);
            return;
        }

        this.logger.log('No cache found, rebuilding in background...');

        this.rebuildAllCache().catch(err =>
            this.logger.error('Background rebuild failed', err)
        );
    }

    // run every 30 mins (max delay when insert 30 mins)
    @Cron(CronExpression.EVERY_30_MINUTES)
    async rebuildAllCache() {
        this.logger.log('Starting cache rebuild...');
        const start = Date.now();

        try {
            // unique equipment+site 
            const equipments: { equipment: string; site: string }[] = await this.repo.query(`
        SELECT equipment, site
        FROM enveloped_fft
        GROUP BY equipment, site
        ORDER BY equipment ASC
      `);

            // group by site
            const siteMap = new Map<string, string[]>();
            siteMap.set('all', []);

            for (const eq of equipments) {
                // list "all"
                if (!siteMap.get('all')!.includes(eq.equipment)) {
                    siteMap.get('all')!.push(eq.equipment);
                }
                // list by site
                if (!siteMap.has(eq.site)) siteMap.set(eq.site, []);
                if (!siteMap.get(eq.site)!.includes(eq.equipment)) {
                    siteMap.get(eq.site)!.push(eq.equipment);
                }
            }

            // keep index list by site
            for (const [site, names] of siteMap.entries()) {
                await this.redisService.setJson(
                    `equipment:index:${site}`,
                    names,
                    7200, // 2 hr
                );
            }

            const allEquipments = [...new Set(equipments.map(e => e.equipment))];
            const BATCH_SIZE = 20;

            for (let i = 0; i < allEquipments.length; i += BATCH_SIZE) {
                const batch = allEquipments.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(name => this.computeEquipment(name)));
                this.logger.log(`Computed ${Math.min(i + BATCH_SIZE, allEquipments.length)}/${allEquipments.length}`);
            }

            this.logger.log(`Cache rebuild done in ${Date.now() - start}ms`);
        } catch (err) {
            this.logger.error('Cache rebuild failed', err);
        }
    }

    private async computeEquipment(equipment: string) {
        const rows: any[] = await this.repo.query(
            `SELECT
         DATE_FORMAT(meas_date, '%Y-%m-%d') AS date_str,
         state,
         MAX(state) OVER (PARTITION BY equipment) AS highest_state,
         JSON_ARRAYAGG(
           JSON_OBJECT('id', CAST(id AS CHAR), 'bpfo', COALESCE(BPFO, 0))
         ) AS points
       FROM enveloped_fft
       WHERE equipment = ?
         AND state IS NOT NULL
       GROUP BY DATE_FORMAT(meas_date, '%Y-%m-%d'), state
       ORDER BY date_str DESC`,
            [equipment],
        );

        await this.redisService.setJson(
            `equipment:data:${equipment}`,
            rows,
            7200,
        );
    }

    async invalidateEquipment(equipment: string) {
        await this.computeEquipment(equipment);
    }
}