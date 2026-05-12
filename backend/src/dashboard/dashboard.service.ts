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
  //   const skip = (page - 1) * limit;
  //   const qb = this.repo.createQueryBuilder('m')
  //     // 1. INNER JOIN 
  //     .innerJoin(
  //       (subQuery) => {
  //         return subQuery
  //           .select('MAX(sub.id)', 'max_id')
  //           .from('enveloped_fft', 'sub')
  //           .groupBy('sub.site')
  //           .addGroupBy('sub.equipment');
  //       },
  //       'latest',
  //       'm.id = latest.max_id'
  //     )
  //     .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state', 'm.adjOptPointValue']);

  //   // 2. Site
  //   if (site && site !== 'all') {
  //     qb.andWhere('m.site = :site', { site });
  //   }

  //   // 3. Filter (Critical / Warning)
  //   const normalizedFilter = filter?.toLowerCase();

  //   if (normalizedFilter === 'critical') {
  //     qb.andWhere('m.state = :state', { state: 6 }); // Critical = 6
  //   } else if (normalizedFilter === 'warning') {
  //     qb.andWhere('m.state = :state', { state: 5 }); // Warning = 5
  //   } else {
  //     qb.andWhere('m.state IN (:...states)', { states: [5, 6] });
  //   }

  //   qb.orderBy('m.state', 'DESC')
  //     .addOrderBy('m.adjOptPointValue', 'DESC')
  //     .skip(skip)
  //     .take(limit);

  //   const [items, total] = await qb.getManyAndCount();

  //   return {
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
  //         status_label: gradeToStatus(grade), //  'Critical' 'Warning' 
  //       };
  //     }),
  //     meta: {
  //       page, limit, total,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }
  async getAttention(
    site?: string,
    filter?: string,
    page = 1,
    limit = 20,
  ) {
    // 1. สร้าง Cache Key ที่ครอบคลุมทุกเงื่อนไข (Site, Filter, Page, Limit)
    const normalizedFilter = filter?.toLowerCase() || 'all';
    const siteKey = site || 'all';
    const cacheKey = `attention:${siteKey}:${normalizedFilter}:${page}:${limit}`;

    // 2. เช็ค Cache ก่อน ถ้ามีก็เสิร์ฟเลย เร็วระดับ Millisecond!
    const cachedData = await this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('m')
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
            .where('ranked.rn = 1'); // เอาเฉพาะ ID ที่เป็นอันดับ 1 (ล่าสุด + แย่สุด)
        },
        'latest',
        'm.id = latest.id' // JOIN กลับด้วย ID 
      )
      .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state', 'm.adjOptPointValue'])
      .where("m.indicator != 'I'"); 

    // เงื่อนไข Site
    if (site && site !== 'all') {
      qb.andWhere('m.site = :site', { site });
    }

    // เงื่อนไข Filter (Critical = 6, Warning = 5)
    if (normalizedFilter === 'critical') {
      qb.andWhere('m.state = :state', { state: 6 }); 
    } else if (normalizedFilter === 'warning') {
      qb.andWhere('m.state = :state', { state: 5 }); 
    } else {
      qb.andWhere('m.state IN (:...states)', { states: [5, 6] });
    }

    qb.orderBy('m.state', 'DESC')
      .addOrderBy('m.adjOptPointValue', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

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
    };

    // 4. เก็บลง Redis Cache 
    await this.cache.set(cacheKey, responseData, 300); // 300 seconds = 5 mins

    return responseData;
  }

  async getOverdue(
    site?: string,
    thresholdDays = 90, // overdue 3 months
    limit = 10,
  ) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - thresholdDays);

    const qb = this.repo.createQueryBuilder('m')
      .innerJoin(
        (subQuery) => {
          return subQuery
            .select('MAX(sub.id)', 'max_id')
            .from('enveloped_fft', 'sub')  /// !!!
            .groupBy('sub.site')
            .addGroupBy('sub.equipment');
        },
        'latest',
        'm.id = latest.max_id' // JOIN Primary Key 
      )
      .where('m.measDate < :targetDate', { targetDate });

    if (site && site !== 'all') {
      qb.andWhere('m.site = :site', { site });
    }

    const statsQb = qb.clone()
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN m.state = 6 THEN 1 ELSE 0 END)', 'criticalCount')
      .addSelect('SUM(CASE WHEN m.state = 5 THEN 1 ELSE 0 END)', 'warningCount')
      .addSelect('MIN(m.measDate)', 'oldestDate');

    const stats = await statsQb.getRawOne();

    const overdueCount = Number(stats.total) || 0;
    const criticalCount = Number(stats.criticalCount) || 0;
    const warningCount = Number(stats.warningCount) || 0;

    let maxDays = 0;
    if (stats.oldestDate) {
      maxDays = daysSinceCheck(String(stats.oldestDate));
    }

    const formatDelay = (days: number): string => {
      if (days >= 365) return `+${Math.floor(days / 365)}yr`;
      if (days >= 30) return `+${Math.floor(days / 30)}mo`;
      return `+${days}d`;
    };

    const itemsQb = qb.clone()
      .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state'])
      .orderBy('m.measDate', 'ASC')
      .take(limit);

    const allOverdue = await itemsQb.getMany();

    const items = allOverdue.map(m => {
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
    });

    return {
      success: true,
      data: {
        overdue_count: overdueCount,
        critical_count: criticalCount,
        warning_count: warningCount,
        max_delay_label: formatDelay(maxDays),
        items,
      },
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