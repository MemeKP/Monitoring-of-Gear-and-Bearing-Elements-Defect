import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Measurement } from './entities/measurement.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { QueryMeasurementDto } from './dto/query-measurement.dto';
import {
  computeGrade, gradeToStatus, daysSinceCheck,
} from '../helpers/grade.helper';
import { analyzeSpectrum } from 'src/helpers/spectrum-analyzer.helper';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,
  ) { }

  // Shared: attach computed fields to a raw entity
  // private enrich(m: Measurement) {
  //   const grade = computeGrade(m.state);
  //   return {
  //     ...m,
  //     grade,
  //     status_label:     gradeToStatus(grade),
  //     days_since_check: daysSinceCheck(m.measDate),
  //     point_value:      m.adjOptPointValue,  // frontend alias
  //   };
  // }

  private enrich(m: Measurement) {
    const grade = computeGrade(m.state);
    const spectrumScore = m.state === 6
      ? analyzeSpectrum(m.envelopedFft, m.detailPeak, m.bpfo, m.df)
      : null;

    return {
      ...m,
      grade,
      status_label: gradeToStatus(grade),
      days_since_check: daysSinceCheck(m.measDate),
      point_value: m.adjOptPointValue,
      is_true_f: spectrumScore?.isTrueF ?? null,
      spectrum_score: spectrumScore?.composite ?? null,
      reject_reason: spectrumScore?.rejectReason ?? null,
      spectrum_features: spectrumScore?.features ?? null,
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

  async findAll(dto: QueryMeasurementDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

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

  async findOne(id: number) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException(`Measurement #${id} not found`);
    return { success: true, data: this.enrich(m) };
  }

  async debugScores() {
    // const F_GOOD_IDS = ['172736', '184495', '135548']
    const TARGET_SITE = 'MMP';
    const fMotorCondition = `
    (m.detail_peak IS NOT NULL AND m.detail_peak != '' AND
    FLOOR(JSON_EXTRACT(m.enveloped_fft, CONCAT('$[', SUBSTRING_INDEX(m.detail_peak, ',', 1), '][0]'))) = 100)`;
    const samples = await this.repo
      .createQueryBuilder('m')
      .where('m.state = 6')
      .andWhere('m.site = :site', { site: TARGET_SITE })
      .andWhere(`NOT ${fMotorCondition}`)
      //     .andWhere(`m.id IN (
      //   SELECT MAX(sub.id) 
      //   FROM enveloped_fft sub
      //   WHERE sub.state = 6
      //   GROUP BY sub.equipment, sub.meas_point
      // )`)
      .orderBy('m.id', 'DESC')
      .getMany();

    // const fGood = await this.repo.find({
    //   where: { id: In(F_GOOD_IDS) }
    // })

    const results = samples.map(m => {
      const score = analyzeSpectrum(m.envelopedFft, m.detailPeak, m.bpfo, m.df);
      return {
        id: m.id,
        site: m.site,
        equipment: m.equipment,
        meas_point: m.measPoint,
        meas_date: m.measDate,
        composite: score.composite,
        is_true_f: score.isTrueF,
        reject_reason: score.rejectReason,
        features: score.features,
      };
    }).sort((a, b) => b.composite - a.composite);

    const passed = results.filter(r => r.is_true_f).length;
    //const passed = results.filter(r => r.is_true_f);
    const buckets = {
      high: results.filter(r => r.composite >= 0.70).length,
      mid: results.filter(r => r.composite >= 0.40 && r.composite < 0.70).length,
      low: results.filter(r => r.composite < 0.40).length,
    };

    //const rejected = results.filter(r => !r.is_true_f);

    const rejectReasons = results.reduce((acc, r) => {
      if (r.reject_reason) acc[r.reject_reason] = (acc[r.reject_reason] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      // f_good_features: fGood.map(m => {
      //   const score = analyzeSpectrum(m.envelopedFft, m.detailPeak, m.bpfo, m.df)
      //   return {
      //     id: m.id,
      //     equipment: m.equipment,
      //     ...score.features,
      //     composite: score.composite,
      //   }
      // }),
      summary: {
        total: results.length,
        passed,
      //  borderline_pass: passed
        //  .slice(5)
       //   .map(r => ({ id: r.id, ...r.features, composite: r.composite })),
       // borderline_fail: rejected
        //  .slice(0, 5)
        //  .map(r => ({ id: r.id, ...r.features, composite: r.composite, reason: r.reject_reason })),
        rejected: results.length - passed,
        pass_rate: `${((passed / results.length) * 100).toFixed(1)}%`,
         buckets,
        reject_reasons: rejectReasons,
        top5: results.slice(0, 5),
        border5: results.filter(r => r.composite >= 0.60 && r.composite <= 0.70).slice(0, 5),
        rejected5: results.slice(-5),
      },
      data: results,
    };

    // return samples
    //   .filter(m => m.id === 171723)
    //   .map(m => {
    //     const score = analyzeSpectrum(m.envelopedFft, m.detailPeak, m.bpfo, m.df);
    //     return {
    //       id: m.id,
    //       composite: score.composite,
    //       reject_reason: score.rejectReason,
    //       features: score.features,  
    //     };
    //   }); 
  }
}



// // POST /measurements 
// async create(dto: CreateMeasurementDto) {
//   const measurement: Measurement = this.repo.create({
//     site:             dto.site,
//     equipment:        dto.equipment,
//     measPoint:        dto.meas_point,
//     measDate:         dto.meas_date,
//     measTime:         dto.meas_time     ?? null,
//     ampType:          dto.amp_type      ?? null,
//     df:               dto.df            ?? null,
//     bpfo:             dto.bpfo          ?? null,
//     f0:               dto.f0            ?? null,
//     ibeta:            dto.ibeta         ?? null,
//     envelopedFft:     dto.enveloped_fft ?? null,
//     detailPeak:       dto.detail_peak   ?? null,
//     optPointValue:    dto.opt_point_value     ?? null,
//     adjOptPointValue: dto.adj_opt_point_value,
//     state:            dto.state         ?? null,
//     peakData:         dto.peak_data     ?? null,
//     pic:              dto.pic           ?? null,
//     seqId:            dto.seq_id        ?? null,
//     scales:            dto.scales         ?? null,
//     whenAction:       dto.when_action ? new Date(dto.when_action) : null,
//   });

//   const saved = await this.repo.save(measurement);
//   return { success: true, data: this.enrich(saved) };
// }

// //  PATCH /measurements/:id
// async update(id: number, dto: UpdateMeasurementDto) {
//   const existing = await this.repo.findOne({ where: { id } });
//   if (!existing) throw new NotFoundException(`Measurement #${id} not found`);

//   // Map DTO snake_case → entity camelCase, only for fields that were sent
//   const patch: Partial<Measurement> = {};
//   if (dto.site             !== undefined) patch.site             = dto.site;
//   if (dto.equipment        !== undefined) patch.equipment        = dto.equipment;
//   if (dto.meas_point       !== undefined) patch.measPoint        = dto.meas_point;
//   if (dto.meas_date        !== undefined) patch.measDate         = dto.meas_date;
//   if (dto.meas_time        !== undefined) patch.measTime         = dto.meas_time;
//   if (dto.amp_type         !== undefined) patch.ampType          = dto.amp_type;
//   if (dto.df               !== undefined) patch.df               = dto.df;
//   if (dto.bpfo             !== undefined) patch.bpfo             = dto.bpfo;
//   if (dto.f0               !== undefined) patch.f0               = dto.f0;
//   if (dto.ibeta            !== undefined) patch.ibeta            = dto.ibeta;
//   if (dto.enveloped_fft    !== undefined) patch.envelopedFft     = dto.enveloped_fft;
//   if (dto.detail_peak      !== undefined) patch.detailPeak       = dto.detail_peak;
//   if (dto.opt_point_value  !== undefined) patch.optPointValue    = dto.opt_point_value;
//   if (dto.adj_opt_point_value !== undefined) patch.adjOptPointValue = dto.adj_opt_point_value;
//   if (dto.state            !== undefined) patch.state            = dto.state;
//   if (dto.peak_data        !== undefined) patch.peakData         = dto.peak_data;
//   if (dto.pic              !== undefined) patch.pic              = dto.pic;
//   if (dto.seq_id           !== undefined) patch.seqId            = dto.seq_id;
//   if (dto.scales            !== undefined) patch.scales            = dto.scales;
//   if (dto.when_action      !== undefined) patch.whenAction       = new Date(dto.when_action);

//   const updated = await this.repo.save({ ...existing, ...patch });
//   return { success: true, data: this.enrich(updated) };
// }

// // DELETE /measurements/:id
// async remove(id: number) {
//   const existing = await this.repo.findOne({ where: { id } });
//   if (!existing) throw new NotFoundException(`Measurement #${id} not found`);
//   await this.repo.remove(existing);
//   return { success: true, data: null, message: `Measurement #${id} deleted` };
// }