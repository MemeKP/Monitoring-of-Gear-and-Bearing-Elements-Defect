import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Measurement } from 'src/measurements/entities/measurement.entity';
import { Repository } from 'typeorm';
import { computeGrade, daysSinceCheck, gradeToStatus } from 'src/helpers/grade.helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,

    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) { }

  private cacheKey(site?: string) {
    return `stats:${site ?? 'all'}`;
  }

  async invalidateCache(site: string) {
    await Promise.all([
      this.cache.del(this.cacheKey(site)),
      this.cache.del(this.cacheKey()),
    ]);
  }

  async getStats(site?: string) {
    const key = this.cacheKey(site);

    // Cache hit → return
    const cached = await this.cache.get(key);
    if (cached) return cached;

    // Cache miss → query DB
    const qb = this.repo.manager.createQueryBuilder()
      .select('ranked.site', 'site')
      .addSelect('ranked.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .from((subQuery) => {
        let sq = subQuery
          .select('sub.site', 'site')
          .addSelect('sub.equipment', 'equipment')
          .addSelect('sub.state', 'state')
          // !!!!
          .addSelect(
            'ROW_NUMBER() OVER(PARTITION BY sub.site, sub.equipment ORDER BY sub.meas_date DESC, sub.state DESC)',
            'rn'
          )
          .from('enveloped_fft', 'sub')
          .where("sub.indicator != 'I'")
          .andWhere('sub.state IS NOT NULL');

        if (site && site !== 'all') {
          sq = sq.andWhere('sub.site = :site', { site });
        }
        return sq;
      }, 'ranked')
      .where('ranked.rn = 1')
      .groupBy('ranked.site')
      .addGroupBy('ranked.state');

    const rawResults = await qb.getRawMany();

    let total = 0;
    const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    const siteDataMap: Record<string, { total: number, counts: Record<string, number> }> = {};

    for (const row of rawResults) {
      const rowSite = row.site;
      const rowState = Number(row.state);
      const count = Number(row.count);
      const grade = computeGrade(rowState);

      total += count;
      if (gradeCounts[grade] !== undefined) {
        gradeCounts[grade] += count;
      }

      if (!siteDataMap[rowSite]) {
        siteDataMap[rowSite] = {
          total: 0,
          counts: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
        };
      }
      siteDataMap[rowSite].total += count;
      if (siteDataMap[rowSite].counts[grade] !== undefined) {
        siteDataMap[rowSite].counts[grade] += count;
      }
    }

    const pct = (n: number, divisor: number) =>
      divisor > 0 ? Math.round((n / divisor) * 1000) / 10 : 0;

    const bySite = Object.keys(siteDataMap).map(siteName => {
      const sData = siteDataMap[siteName];
      return {
        site: siteName,
        total_machines: sData.total,
        stage_breakdown: ['F', 'E', 'D', 'C', 'B', 'A'].map(g => ({
          grade: g,
          count: sData.counts[g],
          percentage: pct(sData.counts[g], sData.total),
        })),
      };
    });

    const result = {
      success: true,
      data: {
        total_machines: total,
        defective_pct: pct(gradeCounts['F'], total),
        careful_pct: pct(gradeCounts['E'], total),
        normal_pct: pct(
          gradeCounts['A'] + gradeCounts['B'] + gradeCounts['C'] + gradeCounts['D'],
          total
        ),
        stage_breakdown: ['F', 'E', 'D', 'C', 'B', 'A'].map(g => ({
          grade: g,
          count: gradeCounts[g],
          percentage: pct(gradeCounts[g], total),
        })),
        by_site: bySite,
      },
    };

    await this.cache.set(key, result, 300_000);
    return result;
  }

  // async getAttention(
  //   site?: string,
  //   filter?: string,
  //   page = 1,
  //   limit = 20,
  // ) {
  //   // create Cache Key (Site, Filter, Page, Limit)
  //   const normalizedFilter = filter?.toLowerCase() || 'all';
  //   const siteKey = site || 'all';
  //   const cacheKey = `attention:${siteKey}:${normalizedFilter}:${page}:${limit}`;

  //   // check Cache 
  //   const cachedData = await this.cache.get(cacheKey);
  //   if (cachedData) {
  //     return cachedData;
  //   }

  //   const skip = (page - 1) * limit;

  //   const qb = this.repo.createQueryBuilder('m')
  //     .innerJoin(
  //       (subQuery) => {
  //         return subQuery
  //           .select('ranked.id', 'id')
  //           .from((sq) => {
  //             return sq
  //               .select('sub.id', 'id')
  //               .addSelect(
  //                 'ROW_NUMBER() OVER(PARTITION BY sub.site, sub.equipment ORDER BY sub.meas_date DESC, sub.state DESC)',
  //                 'rn'
  //               )
  //               .from('enveloped_fft', 'sub')
  //               .where("sub.indicator != 'I'")
  //               .andWhere('sub.state IS NOT NULL');
  //           }, 'ranked')
  //           .where('ranked.rn = 1'); // ID 1st (latest + worst)
  //       },
  //       'latest',
  //       'm.id = latest.id' // JOIN ID 
  //     )
  //     .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state', 'm.adjOptPointValue'])
  //     .where("m.indicator != 'I'");

  //   // Site
  //   if (site && site !== 'all') {
  //     qb.andWhere('m.site = :site', { site });
  //   }

  //   const fMotorCondition = `
  // (m.detail_peak IS NOT NULL AND m.detail_peak != '' AND
  // FLOOR(JSON_EXTRACT(m.enveloped_fft, CONCAT('$[', SUBSTRING_INDEX(m.detail_peak, ',', 1), '][0]'))) = 100)`;
  //   if (normalizedFilter === 'critical') {
  //     // filter state 6 but cant be F-Motor
  //     qb.andWhere('m.state = :state', { state: 6 });
  //     qb.andWhere(`NOT ${fMotorCondition}`);
  //   } else if (normalizedFilter === 'warning') {
  //     // warning 
  //     qb.andWhere('m.state = :state', { state: 5 });
  //     qb.andWhere(`NOT ${fMotorCondition}`);
  //   } else if (normalizedFilter === 'f_motor') {
  //     // f-motor 
  //     qb.andWhere(fMotorCondition);
  //   } else {
  //     // all
  //     qb.andWhere(`(m.state IN (:...states) OR ${fMotorCondition})`, { states: [5, 6] });
  //   }

  //   qb.orderBy('m.state', 'DESC')
  //     .addOrderBy('m.adjOptPointValue', 'DESC')
  //     .skip(skip)
  //     .take(limit);

  //   const [items, total] = await qb.getManyAndCount();

  //   const statsQb = qb.clone().select([
  //     `SUM(CASE WHEN m.state = 6 AND NOT (${fMotorCondition}) THEN 1 ELSE 0 END) AS critical_count`,
  //     `SUM(CASE WHEN m.state = 5 AND NOT (${fMotorCondition}) THEN 1 ELSE 0 END) AS warning_count`,
  //     `SUM(CASE WHEN ${fMotorCondition} THEN 1 ELSE 0 END) AS f_motor_count`,
  //     `COUNT(m.id) AS all_count`
  //   ])


  //   const rawStats = await statsQb.getRawOne();

  //   const allStats = Number(rawStats?.all_count)
  //   const criticalStats = Number(rawStats?.critical_count)
  //   const warningStats = Number(rawStats?.warning_count)
  //   const fMotorStats = Number(rawStats?.f_motor_count)

  //   const responseData = {
  //     success: true,
  //     data: items.map(m => {
  //       const grade = computeGrade(m.state);
  //       return {
  //         id: m.id,
  //         equipment: m.equipment,
  //         site: m.site,
  //         meas_point: m.measPoint,
  //         meas_date: m.measDate,
  //         point_value: m.adjOptPointValue,
  //         grade,
  //         days_since_check: daysSinceCheck(m.measDate),
  //         status_label: gradeToStatus(grade),
  //       };
  //     }),
  //     meta: {
  //       page, limit, total,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //     stats: {
  //       allStats: allStats,
  //       criticalStats: criticalStats,
  //       warningStats: warningStats,
  //       fMotorStats: fMotorStats,
  //     },
  //   };
  //   await this.cache.set(cacheKey, responseData, 300); // 5 mins
  //   return responseData;
  // }
  async getAttention(
    site?: string,
    filter?: string,
    page = 1,
    limit = 20,
  ) {
    const normalizedFilter = filter?.toLowerCase() || 'all';
    const siteKey = site || 'all';
    const cacheKey = `attention:${siteKey}:${normalizedFilter}:${page}:${limit}`;

    const cachedData = await this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const skip = (page - 1) * limit;

    const fMotorCondition = `
    (m.detail_peak IS NOT NULL AND m.detail_peak != '' AND
    FLOOR(JSON_EXTRACT(m.enveloped_fft, CONCAT('$[', SUBSTRING_INDEX(m.detail_peak, ',', 1), '][0]'))) = 100)`;

    const baseQb = this.repo.createQueryBuilder('m')
      .innerJoin(
        (subQuery) => {
          return subQuery
            .select('ranked.id', 'id')
            .from((sq) => {
              return sq
                .select('sub.id', 'id')
                .addSelect(
                  'ROW_NUMBER() OVER(PARTITION BY sub.site, sub.equipment ORDER BY sub.meas_date DESC, sub.state DESC)',
                  'rn'
                )
                .from('enveloped_fft', 'sub')
                .where("sub.indicator != 'I'")
                .andWhere('sub.state IS NOT NULL');
            }, 'ranked')
            .where('ranked.rn = 1');
        },
        'latest',
        'm.id = latest.id'
      )
      .where("m.indicator != 'I'");

    if (site && site !== 'all') {
      baseQb.andWhere('m.site = :site', { site });
    }

    const statsQb = baseQb.clone()
      .andWhere(`(m.state IN (:...states) OR ${fMotorCondition})`, { states: [5, 6] })
      .select([
        `SUM(CASE WHEN m.state = 6 AND NOT (${fMotorCondition}) THEN 1 ELSE 0 END) AS critical_count`,
        `SUM(CASE WHEN m.state = 5 AND NOT (${fMotorCondition}) THEN 1 ELSE 0 END) AS warning_count`,
        `SUM(CASE WHEN ${fMotorCondition} THEN 1 ELSE 0 END) AS f_motor_count`,
        `COUNT(m.id) AS all_count`,
      ]);

    // filter QB 
    const qb = baseQb.clone()
      .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state', 'm.adjOptPointValue']);

    if (normalizedFilter === 'critical') {
      qb.andWhere('m.state = :state', { state: 6 });
      qb.andWhere(`NOT ${fMotorCondition}`);
    } else if (normalizedFilter === 'warning') {
      qb.andWhere('m.state = :state', { state: 5 });
      qb.andWhere(`NOT ${fMotorCondition}`);
    } else if (normalizedFilter === 'f_motor') {
      qb.andWhere(fMotorCondition);
    } else {
      qb.andWhere(`(m.state IN (:...states) OR ${fMotorCondition})`, { states: [5, 6] });
    }

    qb.orderBy('m.state', 'DESC')
      .addOrderBy('m.adjOptPointValue', 'DESC')
      .skip(skip)
      .take(limit);

    const [[items, total], rawStats] = await Promise.all([
      qb.getManyAndCount(),
      statsQb.getRawOne(),
    ]);

    const responseData = {
      success: true,
      data: items.map(m => {
        const grade = computeGrade(m.state);
        return {
          id: m.id,
          equipment: m.equipment,
          site: m.site,
          meas_point: m.measPoint,
          meas_date: m.measDate,
          point_value: m.adjOptPointValue,
          grade,
          days_since_check: daysSinceCheck(m.measDate),
          status_label: gradeToStatus(grade),
        };
      }),
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        allStats: Number(rawStats?.all_count ?? 0),
        criticalStats: Number(rawStats?.critical_count ?? 0),
        warningStats: Number(rawStats?.warning_count ?? 0),
        fMotorStats: Number(rawStats?.f_motor_count ?? 0),
      },
    };

    await this.cache.set(cacheKey, responseData, 300);
    return responseData;
  }

  // async getOverdue(
  //   site?: string,
  //   thresholdDays = 90, // overdue 3 months
  //   limit = 10,
  // ) {
  //   const targetDate = new Date();
  //   targetDate.setDate(targetDate.getDate() - thresholdDays);

  //   const qb = this.repo.createQueryBuilder('m')
  //     .innerJoin(
  //       (subQuery) => {
  //         return subQuery
  //           .select('MAX(sub.id)', 'max_id')
  //           .from('enveloped_fft', 'sub')  
  //           .groupBy('sub.site')
  //           .addGroupBy('sub.equipment');
  //       },
  //       'latest',
  //       'm.id = latest.max_id' // JOIN Primary Key 
  //     )
  //     .where('m.measDate < :targetDate', { targetDate });

  //   if (site && site !== 'all') {
  //     qb.andWhere('m.site = :site', { site });
  //   }

  //   const statsQb = qb.clone()
  //     .select('COUNT(*)', 'total')
  //     .addSelect('SUM(CASE WHEN m.state = 6 THEN 1 ELSE 0 END)', 'criticalCount')
  //     .addSelect('SUM(CASE WHEN m.state = 5 THEN 1 ELSE 0 END)', 'warningCount')
  //     .addSelect('MIN(m.measDate)', 'oldestDate');

  //   const stats = await statsQb.getRawOne();

  //   const overdueCount = Number(stats.total) || 0;
  //   const criticalCount = Number(stats.criticalCount) || 0;
  //   const warningCount = Number(stats.warningCount) || 0;

  //   let maxDays = 0;
  //   if (stats.oldestDate) {
  //     maxDays = daysSinceCheck(String(stats.oldestDate));
  //   }

  //   const formatDelay = (days: number): string => {
  //     if (days >= 365) return `+${Math.floor(days / 365)}yr`;
  //     if (days >= 30) return `+${Math.floor(days / 30)}mo`;
  //     return `+${days}d`;
  //   };

  //   const itemsQb = qb.clone()
  //     .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state'])
  //     .orderBy('m.measDate', 'ASC')
  //     .take(limit);

  //   const allOverdue = await itemsQb.getMany();

  //   const items = allOverdue.map(m => {
  //     const grade = computeGrade(m.state);
  //     return {
  //       id: m.id,
  //       equipment: m.equipment,
  //       site: m.site,
  //       meas_point: m.measPoint,
  //       meas_date: m.measDate,
  //       grade,
  //       status_label: gradeToStatus(grade),
  //       days_since_check: daysSinceCheck(m.measDate),
  //     };
  //   });

  //   return {
  //     success: true,
  //     data: {
  //       overdue_count: overdueCount,
  //       critical_count: criticalCount,
  //       warning_count: warningCount,
  //       max_delay_label: formatDelay(maxDays),
  //       items,
  //     },
  //   };
  // }

  async getOverdue(
    site?: string,
    thresholdDays = 90,
    page = 1,
    limit = 10,
    filter = 'all',
  ) {
    const normalizedFilter = filter?.toLowerCase() || 'all';
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - thresholdDays);
    const skip = (page - 1) * limit;

    const peakCondition = `
  (m.detail_peak IS NOT NULL AND m.detail_peak != '' AND
   FLOOR(JSON_EXTRACT(m.enveloped_fft, CONCAT('$[', SUBSTRING_INDEX(m.detail_peak, ',', 1), '][0]'))) = 100)`;

    const fMotorCondition = `(m.state = 6 AND ${peakCondition})`;
    const FCondition = `(m.state = 6 AND NOT ${peakCondition})`;

    // const fMotorCondition = `m.state = 6 AND
    // (m.detail_peak IS NOT NULL AND m.detail_peak != '' AND
    // FLOOR(JSON_EXTRACT(m.enveloped_fft, CONCAT('$[', SUBSTRING_INDEX(m.detail_peak, ',', 1), '][0]'))) = 100)`;

    const baseQb = this.repo.createQueryBuilder('m')
      .innerJoin(
        (subQuery) => {
          return subQuery
            .select('MAX(sub.id)', 'max_id')
            .from('enveloped_fft', 'sub')
            .groupBy('sub.site')
            .addGroupBy('sub.equipment');
        },
        'latest',
        'm.id = latest.max_id'
      )
      .where('m.measDate < :targetDate', { targetDate });

    if (site && site !== 'all') {
      baseQb.andWhere('m.site = :site', { site });
    }

    const statsQb = baseQb.clone().select([
      'COUNT(m.id) AS total',
       `SUM(CASE WHEN ${FCondition} THEN 1 ELSE 0 END) AS criticalCount`,
      'SUM(CASE WHEN m.state = 5 THEN 1 ELSE 0 END) AS warningCount',
      'SUM(CASE WHEN m.state = 4 THEN 1 ELSE 0 END) AS dCount',
      'SUM(CASE WHEN m.state = 3 THEN 1 ELSE 0 END) AS cCount',
      'SUM(CASE WHEN m.state = 2 THEN 1 ELSE 0 END) AS bCount',
      'SUM(CASE WHEN m.state = 1 THEN 1 ELSE 0 END) AS aCount',
      `SUM(CASE WHEN ${fMotorCondition} THEN 1 ELSE 0 END) AS fMotorCount`,
      'MIN(m.measDate) AS oldestDate',
    ]);

    const itemsQb = baseQb.clone()
      .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state']);

    if (normalizedFilter === 'f') {
      itemsQb.andWhere(FCondition);
      // itemsQb.andWhere(`NOT ${fMotorCondition}`);
    } else if (normalizedFilter === 'f_motor') {
      itemsQb.andWhere(fMotorCondition);
    } else if (normalizedFilter === 'e') {
      itemsQb.andWhere('m.state = :state', { state: 5 });
    } else if (normalizedFilter === 'd') {
      itemsQb.andWhere('m.state = :state', { state: 4 });
    } else if (normalizedFilter === 'c') {
      itemsQb.andWhere('m.state = :state', { state: 3 });
    } else if (normalizedFilter === 'b') {
      itemsQb.andWhere('m.state = :state', { state: 2 });
    } else if (normalizedFilter === 'a') {
      itemsQb.andWhere('m.state = :state', { state: 1 });
    }

    itemsQb.orderBy('m.measDate', 'ASC').skip(skip).take(limit);

    const [stats, [items, total]] = await Promise.all([
      statsQb.getRawOne(),
      itemsQb.getManyAndCount(),
    ]);

    let maxDays = 0;
    if (stats.oldestDate) {
      maxDays = daysSinceCheck(String(stats.oldestDate));
    }

    const formatDelay = (days: number): string => {
      if (days >= 365) return `+${Math.floor(days / 365)}yr`;
      if (days >= 30) return `+${Math.floor(days / 30)}mo`;
      return `+${days}d`;
    };

    return {
      success: true,
      stats: {
        overdue_count: Number(stats.total) || 0,
        critical_count: Number(stats.criticalCount) || 0,
        warning_count: Number(stats.warningCount) || 0,
        d_count: Number(stats.dCount) || 0,
        c_count: Number(stats.cCount) || 0,
        b_count: Number(stats.bCount) || 0,
        a_count: Number(stats.aCount) || 0,
        f_motor_count: Number(stats.fMotorCount) || 0,
        max_delay_label: formatDelay(maxDays),
      },
      data: items.map(m => {
        const grade = computeGrade(m.state);
        return {
          id: m.id,
          equipment: m.equipment,
          site: m.site,
          meas_point: m.measPoint,
          meas_date: m.measDate,
          grade,
          status_label: gradeToStatus(grade),
          days_since_check: daysSinceCheck(m.measDate),
        };
      }),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }
}

//  async getStats(site?: string) {
//     const qb = this.repo.createQueryBuilder('m')
//       .select('m.site', 'site')
//       .addSelect('m.state', 'state')
//       .addSelect('COUNT(*)', 'count')
//       .where('m.state IS NOT NULL')
//       .groupBy('m.site')
//       .addGroupBy('m.state');

//     if (site && site !== 'all') {
//       qb.andWhere('m.site = :site', { site });
//     }

//     const rawResults = await qb.getRawMany();

//     let total = 0;
//     const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
//     const siteDataMap: Record<string, { total: number, counts: Record<string, number> }> = {};

//     for (const row of rawResults) {
//       const rowSite = row.site;
//       const rowState = Number(row.state);
//       const count = Number(row.count);
//       const grade = computeGrade(rowState);

//       total += count;
//       if (gradeCounts[grade] !== undefined) {
//         gradeCounts[grade] += count;
//       }

//       if (!siteDataMap[rowSite]) {
//         siteDataMap[rowSite] = {
//           total: 0,
//           counts: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
//         };
//       }
//       siteDataMap[rowSite].total += count;
//       if (siteDataMap[rowSite].counts[grade] !== undefined) {
//         siteDataMap[rowSite].counts[grade] += count;
//       }
//     }

//     const pct = (n: number, divisor: number) =>
//       divisor > 0 ? Math.round((n / divisor) * 1000) / 10 : 0;

//     const bySite = Object.keys(siteDataMap).map(siteName => {
//       const sData = siteDataMap[siteName];
//       return {
//         site: siteName,
//         total_machines: sData.total,
//         stage_breakdown: ['F', 'E', 'D', 'C', 'B', 'A'].map(g => ({
//           grade: g,
//           count: sData.counts[g],
//           percentage: pct(sData.counts[g], sData.total),
//         })),
//       };
//     });

//     return {
//       success: true,
//       data: {
//         total_machines: total,
//         defective_pct: pct(gradeCounts['F'], total),
//         careful_pct: pct(gradeCounts['E'], total),
//         normal_pct: pct(
//           gradeCounts['A'] + gradeCounts['B'] + gradeCounts['C'] + gradeCounts['D'],
//           total
//         ),
//         stage_breakdown: ['F', 'E', 'D', 'C', 'B', 'A'].map(g => ({
//           grade: g,
//           count: gradeCounts[g],
//           percentage: pct(gradeCounts[g], total),
//         })),
//         by_site: bySite,
//       },
//     };
//   }

//  async getAttention(
//     site?: string,
//     filter?: string,   
//     page = 1,
//     limit = 20,
//   ) {
//     const skip = (page - 1) * limit;
//     const qb = this.repo.createQueryBuilder('m')
//       .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state', 'm.adjOptPointValue']);

//     if (site && site !== 'all') {
//       qb.andWhere('m.site = :site', { site });
//     } else {
//       qb.where('1=1');
//     }

//     const normalizedFilter = filter?.toLowerCase();

//     if (normalizedFilter === 'critical') {
//       qb.andWhere('m.state = :state', { state: 6 });
//     } else if (normalizedFilter === 'warning') {
//       qb.andWhere('m.state = :state', { state: 5 });
//     } else {
//       qb.andWhere('m.state IN (:...states)', { states: [5, 6] });
//     }

//     qb.orderBy('m.state', 'DESC')
//       .addOrderBy('m.adjOptPointValue', 'DESC')
//       .skip(skip)
//       .take(limit);

//     const [items, total] = await qb.getManyAndCount();

//     return {
//       success: true,
//       data: items.map(m => {
//         const grade = computeGrade(m.state);
//         return {
//           id: m.id,
//           equipment: m.equipment,
//           site: m.site,
//           meas_point: m.measPoint,
//           meas_date: m.measDate,
//           point_value: m.adjOptPointValue,
//           grade,
//           days_since_check: daysSinceCheck(m.measDate),
//           status_label: gradeToStatus(grade),
//         };
//       }),
//       meta: {
//         page, limit, total,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

// async getOverdue(
//   site?: string,
//   thresholdDays = 90, // overdue 3 months
//   limit = 10,
// ) {
//   const targetDate = new Date();
//   targetDate.setDate(targetDate.getDate() - thresholdDays);

//   const qb = this.repo.createQueryBuilder('m')
//     .where('m.measDate < :targetDate', { targetDate });

//   if (site && site !== 'all') {
//     qb.andWhere('m.site = :site', { site });
//   }

//   const statsQb = qb.clone()
//     .select('COUNT(*)', 'total')
//     .addSelect('SUM(CASE WHEN m.state = 6 THEN 1 ELSE 0 END)', 'criticalCount')
//     .addSelect('SUM(CASE WHEN m.state = 5 THEN 1 ELSE 0 END)', 'warningCount')
//     .addSelect('MIN(m.measDate)', 'oldestDate');

//   const stats = await statsQb.getRawOne();

//   const overdueCount = Number(stats.total) || 0;
//   const criticalCount = Number(stats.criticalCount) || 0;
//   const warningCount = Number(stats.warningCount) || 0;

//   let maxDays = 0;
//   if (stats.oldestDate) {
//     maxDays = daysSinceCheck(String(stats.oldestDate));
//   }

//   const formatDelay = (days: number): string => {
//     if (days >= 365) return `+${Math.floor(days / 365)}yr`;
//     if (days >= 30) return `+${Math.floor(days / 30)}mo`;
//     return `+${days}d`;
//   };

//   const itemsQb = qb.clone()
//     .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state'])
//     .orderBy('m.measDate', 'ASC')
//     .take(limit);

//   const allOverdue = await itemsQb.getMany();

//   const items = allOverdue.map(m => {
//     const grade = computeGrade(m.state);
//     return {
//       id: m.id,
//       equipment: m.equipment,
//       site: m.site,
//       meas_point: m.measPoint,
//       meas_date: m.measDate,
//       grade,
//       status_label: gradeToStatus(grade),
//       days_since_check: daysSinceCheck(m.measDate),
//     };
//   });

//   return {
//     success: true,
//     data: {
//       overdue_count: overdueCount,
//       critical_count: criticalCount,
//       warning_count: warningCount,
//       max_delay_label: formatDelay(maxDays),
//       items,
//     },
//   };
// }