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