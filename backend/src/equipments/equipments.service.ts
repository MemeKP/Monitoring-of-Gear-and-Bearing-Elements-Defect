import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measurement } from 'src/measurements/entities/measurement.entity';
import { computeGrade, daysSinceCheck, gradeToStatus } from 'src/helpers/grade.helper';
import { QueryEquipmentDto } from './dto/query-equipment.dto';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,
  ) { }

  private enrich(m: Measurement) {
    const grade = computeGrade(m.state);
    return {
      id: m.id,
      site: m.site,
      equipment: m.equipment,
      meas_point: m.measPoint,
      meas_date: m.measDate,
      meas_time: m.measTime,
      bpfo: m.bpfo,
      f0: m.f0,
      ibeta: m.ibeta,
      grade,
      status_label: gradeToStatus(grade),
      point_value: m.adjOptPointValue,
      days_since_check: daysSinceCheck(m.measDate),
      state: m.state,
      pic: m.pic,
      seq_id: m.seqId,
      when_action: m.whenAction,
    };
  }

  // create(createEquipmentDto: CreateEquipmentDto) {
  //   return 'This action adds a new equipment';
  // }

  async findAll(dto: QueryEquipmentDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 20;
    const skip = (page - 1) * limit;

    const subQuery = this.repo
      .createQueryBuilder('sub')
      .select('MAX(sub.id)', 'max_id')
      .groupBy('sub.equipment')
      .addGroupBy('sub.site');

    const qb = this.repo
      .createQueryBuilder('m')
      .where(`m.id IN (${subQuery.getQuery()})`);

    if (dto.site && dto.site !== 'all') {
      qb.andWhere('m.site = :site', { site: dto.site });
    }

    if (dto.search) {
      qb.andWhere('m.equipment LIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    if (dto.grade && dto.grade !== 'all') {
      const grades = dto.grade.split(',').map(g => g.trim().toUpperCase());
      const conds: string[] = [];
      const params: Record<string, number> = {};

      const ranges: Record<string, [string, number, number | null]> = {
        F: ['>', 30, null],
        E: ['BETWEEN', 20, 30],
        D: ['BETWEEN', 15, 20],
        C: ['BETWEEN', 10, 15],
        B: ['BETWEEN', 5, 10],
        A: ['<=', 5, null],
      };

      grades.forEach((g, i) => {
        const r = ranges[g];
        if (!r) return;
        const [op, low, high] = r;
        if (op === 'BETWEEN') {
          conds.push(`(m.adjOptPointValue > :low${i} AND m.adjOptPointValue <= :high${i})`);
          params[`low${i}`] = low;
          params[`high${i}`] = high!;
        } else if (op === '>') {
          conds.push(`m.adjOptPointValue > :low${i}`);
          params[`low${i}`] = low;
        } else {
          conds.push(`m.adjOptPointValue <= :low${i}`);
          params[`low${i}`] = low;
        }
      });

      if (conds.length) qb.andWhere(`(${conds.join(' OR ')})`, params);
    }

    if (dto.status && dto.status !== 'all') {
      const statusMap: Record<string, string> = {
        critical: 'F',
        warning: 'E',
        careful: 'D',
        normal: 'A,B,C',
      };
      const gradeStr = statusMap[dto.status.toLowerCase()];
      if (gradeStr) {
        dto.grade = gradeStr;
      }
    }

    const sortMap: Record<string, string> = {
      id: 'm.id',
      // days_since_check: 'm.measDate',
      // point_value: 'm.adjOptPointValue',
      // grade: 'm.state',  
      // equipment: 'm.equipment',
    };
    const sortCol = sortMap[dto.sort ?? 'id'] ?? 'm.id';
    const sortDir = (dto.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';

    qb.orderBy(sortCol, sortDir);

    const [items, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: items.map(m => this.enrich(m)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) {
      throw new Error(`Equipment record #${id} not found`);
    }
    return { success: true, data: this.enrich(m) };
  }

  async findHistory(id: number, page = 1, limit = 20) {
    const target = await this.repo.findOne({ where: { id } });
    if (!target) throw new Error(`Equipment record #${id} not found`);

    const skip = (page - 1) * limit;

    const [items, total] = await this.repo.findAndCount({
      where: {
        equipment: target.equipment,
        site: target.site,
      },
      order: { measDate: 'DESC', id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: items.map(m => this.enrich(m)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
  //   return `This action updates a #${id} equipment`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} equipment`;
  // }
}
