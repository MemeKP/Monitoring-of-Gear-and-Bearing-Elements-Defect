import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Measurement } from 'src/measurements/entities/measurement.entity';
import { Repository } from 'typeorm';
import { computeGrade, daysSinceCheck, gradeToStatus } from 'src/helpers/grade.helper';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,
  ) { }

  private latestPerEquipmentSubQuery() {
    return this.repo
      .createQueryBuilder('sub')
      .select('MAX(sub.id)', 'max_id')
      .groupBy('sub.equipment')
      .addGroupBy('sub.site');
  }

  // async getStats(site?: string) {
  //   const qb = this.repo.createQueryBuilder('m');

  //   if (site && site !== 'all') {
  //     qb.andWhere('m.site = :site', { site });
  //   }

  //   const allLatest = await qb.getMany();

  //   // exclude null states 
  //   const filtered = allLatest.filter(m => m.state !== null);

  //   const total = filtered.length;

  //   const gradeCounts: Record<string, number> = {
  //     A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
  //   };

  //   for (const m of filtered) {
  //     const grade = computeGrade(m.state);
  //     gradeCounts[grade]++;
  //   }

  //   const pct = (n: number) =>
  //     total > 0 ? Math.round((n / total) * 1000) / 10 : 0;

  //   // by-site uses SAME dataset
  //   const bySiteMap = new Map<string, typeof filtered>();

  //   for (const m of filtered) {
  //     if (!bySiteMap.has(m.site)) {
  //       bySiteMap.set(m.site, []);
  //     }
  //     bySiteMap.get(m.site)!.push(m);
  //   }

  //   const bySite = Array.from(bySiteMap.entries()).map(([siteName, machines]) => {
  //     const siteGradeCounts: Record<string, number> = {
  //       A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
  //     };

  //     for (const m of machines) {
  //       const grade = computeGrade(m.state);
  //       siteGradeCounts[grade]++;
  //     }

  //     const siteTotal = machines.length;

  //     const sitePct = (n: number) =>
  //       siteTotal > 0 ? Math.round((n / siteTotal) * 1000) / 10 : 0;

  //     return {
  //       site: siteName,
  //       total_machines: siteTotal,
  //       stage_breakdown: ['F', 'E', 'D', 'C', 'B', 'A'].map(g => ({
  //         grade: g,
  //         count: siteGradeCounts[g],
  //         percentage: sitePct(siteGradeCounts[g]),
  //       })),
  //     };
  //   });

  //   return {
  //     success: true,
  //     data: {
  //       total_machines: total,
  //       defective_pct: pct(gradeCounts['F']),
  //       careful_pct: pct(gradeCounts['E']),
  //       normal_pct: pct(
  //         gradeCounts['A'] +
  //         gradeCounts['B'] +
  //         gradeCounts['C'] +
  //         gradeCounts['D']
  //       ),
  //       stage_breakdown: ['F', 'E', 'D', 'C', 'B', 'A'].map(g => ({
  //         grade: g,
  //         count: gradeCounts[g],
  //         percentage: pct(gradeCounts[g]),
  //       })),
  //       by_site: bySite,
  //     },
  //   };
  // }

  async getStats(site?: string) {
    const qb = this.repo.createQueryBuilder('m')
      .select('m.site', 'site')
      .addSelect('m.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .where('m.state IS NOT NULL')
      .groupBy('m.site')
      .addGroupBy('m.state');

    if (site && site !== 'all') {
      qb.andWhere('m.site = :site', { site });
    }

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

    return {
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
  }

  // async getAttention(
  //   site?: string,
  //   filter?: string,
  //   page = 1,
  //   limit = 20,
  // ) {
  //   const skip = (page - 1) * limit;
  //   const qb = this.repo.createQueryBuilder('m');

  //   if (site && site !== 'all') {
  //     qb.andWhere('m.site = :site', { site });
  //   } else {
  //     // just a dummy where
  //     qb.where('1=1');
  //   }

  //   const normalizedFilter = filter?.toLowerCase();

  //   // "Critical" = Grade F, "Warning" = Grade E
  //   if (normalizedFilter === 'critical') {
  //     qb.andWhere('m.state = :state', { state: 6 });
  //   } else if (normalizedFilter === 'warning') {
  //     qb.andWhere('m.state = :state', { state: 5 });
  //   } else {
  //     qb.andWhere('m.state IN (:...states)', { states: [5, 6] });
  //   }

  //   // Sort by worst first
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
  //         status_label: gradeToStatus(grade),
  //       };
  //     }),
  //     meta: {
  //       page, limit, total,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  // async getOverdue(
  //   site?: string,
  //   thresholdDays = 90, // overdue 3 months
  //   limit = 10,
  // ) {
  //   const subQuery = this.latestPerEquipmentSubQuery();

  //   const qb = this.repo
  //     .createQueryBuilder('m')
  //     .where(`m.id IN (${subQuery.getQuery()})`);

  //   if (site && site !== 'all') {
  //     qb.andWhere('m.site = :site', { site });
  //   }

  //   // Overdue = last measurement was more than thresholdDays ago
  //   qb.andWhere(
  //     `DATEDIFF(CURRENT_DATE(), m.measDate) > :days`,
  //     { days: thresholdDays },
  //   );

  //   qb.orderBy('m.measDate', 'ASC');  // oldest first = most overdue first

  //   const allOverdue = await qb.getMany();
  //   const overdueCount = allOverdue.length;

  //   // Summary box
  //   let criticalCount = 0;
  //   let warningCount = 0;
  //   let maxDays = 0;

  //   for (const m of allOverdue) {
  //     const grade = computeGrade(m.state);
  //     if (grade === 'F') criticalCount++;
  //     if (grade === 'E') warningCount++;
  //     const days = daysSinceCheck(m.measDate);
  //     if (days > maxDays) maxDays = days;
  //   }

  //   // Format max delay like "+9yr" 
  //   const formatDelay = (days: number): string => {
  //     if (days >= 365) return `+${Math.floor(days / 365)}yr`;
  //     if (days >= 30) return `+${Math.floor(days / 30)}mo`;
  //     return `+${days}d`;
  //   };

  //   // Only return the top `limit` items for the panel
  //   const items = allOverdue.slice(0, limit).map(m => {
  //     const grade = computeGrade(m.adjOptPointValue);
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
  //       max_delay_label: formatDelay(maxDays),   // "+9yr" shown in top-right box
  //       items,
  //     },
  //   };
  // }

  async getAttention(
    site?: string,
    filter?: string,   
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('m')
      .select(['m.id', 'm.equipment', 'm.site', 'm.measPoint', 'm.measDate', 'm.state', 'm.adjOptPointValue']);

    if (site && site !== 'all') {
      qb.andWhere('m.site = :site', { site });
    } else {
      qb.where('1=1');
    }

    const normalizedFilter = filter?.toLowerCase();

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

    return {
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
  }

  async getOverdue(
    site?: string,
    thresholdDays = 90, // overdue 3 months
    limit = 10,
  ) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - thresholdDays);

    const qb = this.repo.createQueryBuilder('m')
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
