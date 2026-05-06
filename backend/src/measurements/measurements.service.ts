import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Measurement } from './entities/measurement.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { QueryMeasurementDto } from './dto/query-measurement.dto';
import {
  computeGrade, gradeToStatus, daysSinceCheck,
} from '../helpers/grade.helper';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,
  ) {}

  // Shared: attach computed fields to a raw entity
  private enrich(m: Measurement) {
    const grade = computeGrade(m.state);
    return {
      ...m,
      grade,
      status_label:     gradeToStatus(grade),
      days_since_check: daysSinceCheck(m.measDate),
      point_value:      m.adjOptPointValue,  // frontend alias
    };
  }

  // Shared: apply all filters to a query builder 
  private applyFilters(
    qb: SelectQueryBuilder<Measurement>,
    dto: QueryMeasurementDto,
  ) {
    if (dto.site && dto.site !== 'all') {
      qb.andWhere('m.site = :site', { site: dto.site });
    }
    if (dto.equipment) {
      qb.andWhere('m.equipment LIKE :eq', { eq: `%${dto.equipment}%` });
    }
    if (dto.meas_point && dto.meas_point !== 'all') {
      qb.andWhere('m.measPoint = :mp', { mp: dto.meas_point });
    }
    if (dto.from) {
      qb.andWhere('m.measDate >= :from', { from: dto.from });
    }
    if (dto.to) {
      qb.andWhere('m.measDate <= :to', { to: dto.to });
    }
    if (dto.amp_type && dto.amp_type !== 'all') {
      qb.andWhere('m.ampType = :at', { at: dto.amp_type });
    }

    // Grade filter — e.g. "F,E" → filter by adj_opt_point_value ranges
    // We translate grade letters back to numeric ranges in SQL
    if (dto.grade && dto.grade !== 'all') {
      const grades = dto.grade.split(',').map(g => g.trim().toUpperCase());
      const conditions: string[] = [];
      const params: Record<string, number> = {};

      if (grades.includes('F')) {
        conditions.push('m.adjOptPointValue > :gradeF');
        params.gradeF = 30;
      }
      if (grades.includes('E')) {
        conditions.push('(m.adjOptPointValue > :gradeELow AND m.adjOptPointValue <= :gradeEHigh)');
        params.gradeELow = 20; params.gradeEHigh = 30;
      }
      if (grades.includes('D')) {
        conditions.push('(m.adjOptPointValue > :gradeDLow AND m.adjOptPointValue <= :gradeDHigh)');
        params.gradeDLow = 15; params.gradeDHigh = 20;
      }
      if (grades.includes('C')) {
        conditions.push('(m.adjOptPointValue > :gradeCLow AND m.adjOptPointValue <= :gradeCHigh)');
        params.gradeCLow = 10; params.gradeCHigh = 15;
      }
      if (grades.includes('B')) {
        conditions.push('(m.adjOptPointValue > :gradeBLow AND m.adjOptPointValue <= :gradeBHigh)');
        params.gradeBLow = 5; params.gradeBHigh = 10;
      }
      if (grades.includes('A')) {
        conditions.push('m.adjOptPointValue <= :gradeA');
        params.gradeA = 5;
      }

      if (conditions.length > 0) {
        qb.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    }

    return qb;
  }

  // GET /measurements 
  async findAll(dto: QueryMeasurementDto) {
    const page  = dto.page  ?? 1;
    const limit = dto.limit ?? 20;
    const skip  = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('m')
      .orderBy('m.measDate', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .skip(skip)
      .take(limit);

    this.applyFilters(qb, dto);

    const [items, total] = await qb.getManyAndCount();

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

  // GET /measurements/:id 
  async findOne(id: number) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException(`Measurement #${id} not found`);
    return { success: true, data: this.enrich(m) };
  }

  // POST /measurements 
  async create(dto: CreateMeasurementDto) {
    const measurement: Measurement = this.repo.create({
      site:             dto.site,
      equipment:        dto.equipment,
      measPoint:        dto.meas_point,
      measDate:         dto.meas_date,
      measTime:         dto.meas_time     ?? null,
      ampType:          dto.amp_type      ?? null,
      df:               dto.df            ?? null,
      bpfo:             dto.bpfo          ?? null,
      f0:               dto.f0            ?? null,
      ibeta:            dto.ibeta         ?? null,
      envelopedFft:     dto.enveloped_fft ?? null,
      detailPeak:       dto.detail_peak   ?? null,
      optPointValue:    dto.opt_point_value     ?? null,
      adjOptPointValue: dto.adj_opt_point_value,
      state:            dto.state         ?? null,
      peakData:         dto.peak_data     ?? null,
      pic:              dto.pic           ?? null,
      seqId:            dto.seq_id        ?? null,
      scales:            dto.scales         ?? null,
      whenAction:       dto.when_action ? new Date(dto.when_action) : null,
    });

    const saved = await this.repo.save(measurement);
    return { success: true, data: this.enrich(saved) };
  }

  //  PATCH /measurements/:id 
  async update(id: number, dto: UpdateMeasurementDto) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Measurement #${id} not found`);

    // Map DTO snake_case → entity camelCase, only for fields that were sent
    const patch: Partial<Measurement> = {};
    if (dto.site             !== undefined) patch.site             = dto.site;
    if (dto.equipment        !== undefined) patch.equipment        = dto.equipment;
    if (dto.meas_point       !== undefined) patch.measPoint        = dto.meas_point;
    if (dto.meas_date        !== undefined) patch.measDate         = dto.meas_date;
    if (dto.meas_time        !== undefined) patch.measTime         = dto.meas_time;
    if (dto.amp_type         !== undefined) patch.ampType          = dto.amp_type;
    if (dto.df               !== undefined) patch.df               = dto.df;
    if (dto.bpfo             !== undefined) patch.bpfo             = dto.bpfo;
    if (dto.f0               !== undefined) patch.f0               = dto.f0;
    if (dto.ibeta            !== undefined) patch.ibeta            = dto.ibeta;
    if (dto.enveloped_fft    !== undefined) patch.envelopedFft     = dto.enveloped_fft;
    if (dto.detail_peak      !== undefined) patch.detailPeak       = dto.detail_peak;
    if (dto.opt_point_value  !== undefined) patch.optPointValue    = dto.opt_point_value;
    if (dto.adj_opt_point_value !== undefined) patch.adjOptPointValue = dto.adj_opt_point_value;
    if (dto.state            !== undefined) patch.state            = dto.state;
    if (dto.peak_data        !== undefined) patch.peakData         = dto.peak_data;
    if (dto.pic              !== undefined) patch.pic              = dto.pic;
    if (dto.seq_id           !== undefined) patch.seqId            = dto.seq_id;
    if (dto.scales            !== undefined) patch.scales            = dto.scales;
    if (dto.when_action      !== undefined) patch.whenAction       = new Date(dto.when_action);

    const updated = await this.repo.save({ ...existing, ...patch });
    return { success: true, data: this.enrich(updated) };
  }

  // DELETE /measurements/:id 
  async remove(id: number) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Measurement #${id} not found`);
    await this.repo.remove(existing);
    return { success: true, data: null, message: `Measurement #${id} deleted` };
  }
}