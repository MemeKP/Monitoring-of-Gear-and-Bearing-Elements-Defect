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

  async getStats(site?: string) {
    // Way 1: Duplicate data
    // const subQuery = this.latestPerEquipmentSubQuery();
    // const qb = this.repo
    //   .createQueryBuilder('m')
    //   .where(`m.id IN (${subQuery.getQuery()})`);

    // Way 2: 
    const qb = this.repo.createQueryBuilder('m')

    if (site && site !== 'all') {
      qb.andWhere('m.site = :site', { site });
    }

    const allLatest = await qb.getMany();
    const total = allLatest.length;

    const gradeCounts: Record<string, number> = {
      A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
    };
    for (const m of allLatest) {
      gradeCounts[computeGrade(m.state)]++;
    }
    const pct = (n: number) =>
      total > 0 ? Math.round((n / total) * 1000) / 10 : 0;

    // per-site breakdown 
    const allForSiteBreakdown = await this.repo
      .createQueryBuilder('m')
      .where(`m.id IN (${this.latestPerEquipmentSubQuery().getQuery()})`)
      .getMany();

    const bySiteMap = new Map<string, Measurement[]>();
    for (const m of allForSiteBreakdown) {
      if (!bySiteMap.has(m.site)) bySiteMap.set(m.site, []);
      bySiteMap.get(m.site)!.push(m);
    }

    const bySite = Array.from(bySiteMap.entries()).map(([siteName, machines]) => {
      const siteGradeCounts: Record<string, number> = {
        A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
      };
      for (const m of machines) {
        siteGradeCounts[computeGrade(m.adjOptPointValue)]++;
      }
      const siteTotal = machines.length;
      const sitePct = (n: number) =>
        siteTotal > 0 ? Math.round((n / siteTotal) * 1000) / 10 : 0;

      return {
        site: siteName,
        total_machines: siteTotal,
        stage_breakdown: ['F', 'E', 'D', 'C', 'B', 'A'].map(g => ({
          grade: g,
          count: siteGradeCounts[g],
          percentage: sitePct(siteGradeCounts[g]),
        })),
      };
    });

    return {
      success: true,
      data: {
        total_machines: total,
        defective_pct: pct(gradeCounts['F']),
        careful_pct: pct(gradeCounts['E']),
        normal_pct: pct(gradeCounts['A'] + gradeCounts['B'] +
          gradeCounts['C'] + gradeCounts['D']),
        stage_breakdown: ['F', 'E', 'D', 'C', 'B', 'A'].map(g => ({
          grade: g,
          count: gradeCounts[g],
          percentage: pct(gradeCounts[g]),
        })),
        by_site: bySite,
      },
    };
  }

  async getAttention(
    site?: string,
    filter?: string,   // "F" | "E" 
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    // const subQuery = this.latestPerEquipmentSubQuery();
    // const qb = this.repo
    //   .createQueryBuilder('m')
    //   .where(`m.id IN (${subQuery.getQuery()})`);

    const qb = this.repo.createQueryBuilder('m');

    if (site && site !== 'all') {
      qb.andWhere('m.site = :site', { site });
    } else {
      // just a dummy where
      qb.where('1=1');
    }

    // "Critical" = Grade F, "Warning" = Grade E
    if (filter === 'critical') {
      qb.andWhere('m.state > :state', { state: 6 });
    } else if (filter === 'warning') {
      qb.andWhere('m.state > :state', { state: 5 });
    } else {
      // "all" = only show machines that need attention (grade E or F)
      qb.andWhere('m.state IN (:...states)', { states: [5, 6] });
    }

    // Sort by worst first
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
    limit = 8,
  ) {
    const subQuery = this.latestPerEquipmentSubQuery();

    const qb = this.repo
      .createQueryBuilder('m')
      .where(`m.id IN (${subQuery.getQuery()})`);

    if (site && site !== 'all') {
      qb.andWhere('m.site = :site', { site });
    }

    // Overdue = last measurement was more than thresholdDays ago
    qb.andWhere(
      `DATEDIFF(CURRENT_DATE(), m.measDate) > :days`,
      { days: thresholdDays },
    );

    qb.orderBy('m.measDate', 'ASC');  // oldest first = most overdue first

    const allOverdue = await qb.getMany();
    const overdueCount = allOverdue.length;

    // Summary box
    let criticalCount = 0;
    let warningCount = 0;
    let maxDays = 0;

    for (const m of allOverdue) {
      const grade = computeGrade(m.adjOptPointValue);
      if (grade === 'F') criticalCount++;
      if (grade === 'E') warningCount++;
      const days = daysSinceCheck(m.measDate);
      if (days > maxDays) maxDays = days;
    }

    // Format max delay like "+9yr" 
    const formatDelay = (days: number): string => {
      if (days >= 365) return `+${Math.floor(days / 365)}yr`;
      if (days >= 30) return `+${Math.floor(days / 30)}mo`;
      return `+${days}d`;
    };

    // Only return the top `limit` items for the panel
    const items = allOverdue.slice(0, limit).map(m => {
      const grade = computeGrade(m.adjOptPointValue);
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
        max_delay_label: formatDelay(maxDays),   // "+9yr" shown in top-right box
        items,
      },
    };
  }

  // create(createDashboardDto: CreateDashboardDto) {
  //   return 'This action adds a new dashboard';
  // }

  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  // update(id: number, updateDashboardDto: UpdateDashboardDto) {
  //   return `This action updates a #${id} dashboard`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} dashboard`;
  // }
}
