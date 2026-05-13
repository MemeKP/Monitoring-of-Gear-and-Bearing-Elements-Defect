import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Measurement } from 'src/measurements/entities/measurement.entity';
import { computeGrade, daysSinceCheck, gradeToStatus } from 'src/helpers/grade.helper';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { TypesenseService } from 'src/shared/typesense.service';

interface RawMachineData {
  id: number;
  equipment: string;
  site: string;
}

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,
    private readonly typesenseService: TypesenseService,
  ) { }

  async syncAllToTypesense() {
    const machines = await this.repo.createQueryBuilder('m')
      .select('MAX(m.id)', 'id')
      .addSelect('m.equipment', 'equipment')
      .addSelect('m.site', 'site')
      .where("m.indicator != 'I'")
      .groupBy('m.site')
      .addGroupBy('m.equipment')
      .getRawMany<RawMachineData>();

    console.log(`Found ${machines.length} machines. Syncing to Typesense...`);

    for (const m of machines) {
      await this.typesenseService.upsertEquipment({
        id: m.id,
        equipment: m.equipment,
        site: m.site,
      });
    }

    return { message: `Synced ${machines.length} machines successfully!` };
  }

  // async searchEquipmentList(searchQuery: string, site?: string) {
  //   const matchedIds = await this.typesenseService.searchEquipment(searchQuery, site);

  //   if (!matchedIds || matchedIds.length === 0) {
  //     return { success: true, data: [] };
  //   }

  //   const equipments = await this.repo.createQueryBuilder('m')
  //     .select([
  //       'm.id',
  //       'm.site',
  //       'm.equipment',
  //       'm.measPoint',
  //       'm.measDate',
  //       'm.measTime',
  //       'm.bpfo',
  //       'm.f0',
  //       'm.ibeta',
  //       'm.state',
  //       'm.adjOptPointValue',
  //       'm.seqId',
  //       'm.whenAction',
  //     ])
  //     .where('m.id IN (:...matchedIds)', { matchedIds })
  //     .getMany();

  //   return { success: true, data: equipments };
  // }

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
      // pic: m.pic,
      seq_id: m.seqId,
      when_action: m.whenAction,
    };
  }

  // create(createEquipmentDto: CreateEquipmentDto) {
  //   return 'This action adds a new equipment';
  // }

  // async findAll(dto: QueryEquipmentDto) {
  //   const page = Number(dto.page) || 1;
  //   const limit = Number(dto.limit) || 20;
  //   const skip = (page - 1) * limit;

  //   const qb = this.repo
  //     .createQueryBuilder('m')

  //   if (dto.status && dto.status !== 'all') {
  //     const statusMap: Record<string, string> = {
  //       critical: 'F',
  //       warning: 'E',
  //       careful: 'D',
  //       normal: 'A,B,C',
  //     };
  //     const gradeStr = statusMap[dto.status.toLowerCase()];
  //     if (gradeStr) dto.grade = gradeStr;
  //   }

  //   if (dto.site && dto.site !== 'all') {
  //     qb.andWhere('m.site = :site', { site: dto.site });
  //   }

  //   if (dto.search) {
  //     qb.andWhere('m.equipment LIKE :search', { search: `%${dto.search}%` });
  //   }

  //   if (dto.grade && dto.grade !== 'all') {
  //     const gradeToState: Record<string, number> = {
  //       A: 1, B: 2, C: 3, D: 4, E: 5, F: 6,
  //     };

  //     const grades = dto.grade.split(',').map(g => g.trim().toUpperCase());
  //     const states = grades.map(g => gradeToState[g]).filter(Boolean);

  //     if (states.length) {
  //       qb.andWhere('m.state IN (:...states)', { states });
  //     }
  //   }

  //   if (dto.status && dto.status !== 'all') {
  //     const statusMap: Record<string, string> = {
  //       critical: 'F',
  //       warning: 'E',
  //       careful: 'D',
  //       normal: 'A,B,C',
  //     };
  //     const gradeStr = statusMap[dto.status.toLowerCase()];
  //     if (gradeStr) {
  //       dto.grade = gradeStr;
  //     }
  //   }

  //   const sortMap: Record<string, string> = {
  //     id: 'm.id',
  //     // days_since_check: 'm.measDate',
  //     // point_value: 'm.adjOptPointValue',
  //     // grade: 'm.state',  
  //     // equipment: 'm.equipment',
  //   };
  //   const sortCol = sortMap[dto.sort ?? 'id'] ?? 'm.id';
  //   const sortDir = (dto.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';

  //   qb.orderBy(sortCol, sortDir);

  //   const [items, total] = await qb
  //     .skip(skip)
  //     .take(limit)
  //     .getManyAndCount();

  //   return {
  //     success: true,
  //     data: items.map(m => this.enrich(m)),
  //     meta: {
  //       page,
  //       limit,
  //       total,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  async findAll(dto: QueryEquipmentDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('m')
      .select([
        'm.id',
        'm.site',
        'm.equipment',
        'm.measPoint',
        'm.measDate',
        'm.measTime',
        'm.bpfo',
        'm.f0',
        'm.ibeta',
        'm.state',
        'm.adjOptPointValue',
        'm.seqId',
        'm.whenAction',
      ]);

    if (dto.status && dto.status !== 'all') {
      const statusMap: Record<string, string> = {
        critical: 'F',
        warning: 'E',
        careful: 'D', //!!!!
        normal: 'A,B,C',
      };
      const gradeStr = statusMap[dto.status.toLowerCase()];
      if (gradeStr) dto.grade = gradeStr;
    }

    if (dto.site && dto.site !== 'all') {
      qb.andWhere('m.site = :site', { site: dto.site });
    }

    if (dto.search && dto.search.trim() !== '') {
      const matchedIds = await this.typesenseService.searchEquipment(dto.search, dto.site);
      if (!matchedIds || matchedIds.length === 0) {
        return {
          success: true,
          data: [],
          meta: { page, limit, total: 0, totalPages: 0 },
        };
      }

      qb.andWhere('m.id IN (:...matchedIds)', { matchedIds });
    }

    if (dto.grade && dto.grade !== 'all') {
      const gradeToState: Record<string, number> = {
        A: 1, B: 2, C: 3, D: 4, E: 5, F: 6,
      };

      const grades = dto.grade.split(',').map(g => g.trim().toUpperCase());
      const states = grades.map(g => gradeToState[g]).filter(Boolean);

      if (states.length) {
        qb.andWhere('m.state IN (:...states)', { states });
      }
    }

    const sortMap: Record<string, string> = {
      id: 'm.id',
      days_since_check: 'm.measDate',
      point_value: 'm.adjOptPointValue',
      grade: 'm.state',
      equipment: 'm.equipment',
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
}
