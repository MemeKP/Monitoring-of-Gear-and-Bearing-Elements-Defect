import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measurement } from 'src/measurements/entities/measurement.entity';
import { computeGrade, daysSinceCheck, gradeToStatus } from 'src/helpers/grade.helper';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { TypesenseService } from 'src/shared/typesense.service';
import { QueryEquipmentTreeDto } from './dto/query-equipment-tree.dto';
import { RedisService } from 'src/redis/redis.service';

interface RawMachineData {
  id: number;
  equipment: string;
  site: string;
}

export interface PointData {
  id: string;
  bpfo: number;
  bpfi: number;
}

export interface MachineNode {
  id: string;
  name: string;
  highestState: number;
  grade: string;
  datesMap: Map<string, Map<string, PointData[]>>;
}

interface EquipmentRaw {
  id: number;
  site: string;
  equipment: string;
  measDate: Date | string;
  state: number;
  bpfo: number | string;
}

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,
    private readonly typesenseService: TypesenseService,
    private readonly redisService: RedisService,
  ) { }

  async syncAllToTypesense() {
    const machines = await this.repo.createQueryBuilder('m')
      .select('m.id', 'id')
      .addSelect('m.equipment', 'equipment')
      .addSelect('m.site', 'site')
      .getRawMany<RawMachineData>();

    console.log(`Found ${machines.length} records. Syncing to Typesense...`);

    for (const m of machines) {
      await this.typesenseService.upsertEquipment({
        id: Number(m.id),
        equipment: m.equipment,
        site: m.site,
      });
    }

    return { message: `Synced ${machines.length} records successfully!` };
  }

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

    // if (dto.search && dto.search.trim() !== '') {
    //   const matchedIds = await this.typesenseService.searchEquipment(dto.search, dto.site);      
    //   if (!matchedIds || matchedIds.length === 0) {
    //     return {
    //       success: true,
    //       data: [],
    //       meta: { page, limit, total: 0, totalPages: 0 },
    //     };
    //   }
    //  qb.andWhere('m.id IN (:...matchedIds)', { matchedIds });
    // }

    if (dto.search && dto.search.trim() !== '') {
      const matchedNames = await this.typesenseService.searchEquipment(dto.search, dto.site);
      if (!matchedNames || matchedNames.length === 0) {
        return {
          success: true,
          data: [],
          meta: { page, limit, total: 0, totalPages: 0 },
        };
      }
      qb.andWhere('m.equipment IN (:...matchedNames)', { matchedNames });
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

    // const countRaw = await qb.clone()
    //   .select('COUNT(*)', 'count')
    //   .getRawOne()

    // const total = Number(countRaw?.count) || 0;

    // !!!!!! 145450 has to be 145550
    const [items, total] = await qb
      .withDeleted()
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // const items = await qb
    //   .withDeleted()
    //   .skip(skip)
    //   .take(limit)
    //   .getMany();

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

  // async findMachineTree(dto: QueryEquipmentTreeDto) {
  //   const page = Number(dto.page) || 1;
  //   const limit = Number(dto.limit) || 20;

  //   const equipmentQb = this.repo
  //     .createQueryBuilder('m')
  //     .select('m.equipment', 'equipment')
  //     .groupBy('m.equipment')
  //     .orderBy('m.equipment', 'ASC');

  //   if (dto.site && dto.site !== 'all') {
  //     equipmentQb.andWhere('m.site = :site', { site: dto.site });
  //   }

  //   if (dto.search && dto.search.trim() !== '') {
  //     equipmentQb.andWhere('m.equipment LIKE :search', { search: `%${dto.search}%` });
  //   }

  //   const countQuery = this.repo
  //     .createQueryBuilder('m')
  //     .select('COUNT(DISTINCT m.equipment)', 'count')

  //   const paginatedEquipments = await equipmentQb
  //     .offset((page - 1) * limit)
  //     .limit(limit)
  //     .getRawMany();

  //   const equipmentNames = paginatedEquipments.map((e) => e.equipment);

  //   if (equipmentNames.length === 0) {
  //     return { success: true, data: [], nextPage: null };
  //   }

  //   const qb = this.repo
  //     .createQueryBuilder('m')
  //     .select([
  //       'm.id',
  //       'm.site',
  //       'm.equipment',
  //       'm.measDate',
  //       'm.state',
  //       'm.bpfo',
  //     ])
  //     .where('m.equipment IN (:...equipmentNames)', { equipmentNames })
  //     .orderBy('m.equipment', 'ASC')
  //     .addOrderBy('m.measDate', 'DESC');

  //   if (dto.site && dto.site !== 'all') {
  //     qb.andWhere('m.site = :site', { site: dto.site });
  //   }

  //   const items = (await qb.getMany()) as EquipmentRaw[];

  //   const stateToGrade: Record<number, string> = {
  //     1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F',
  //   };

  //   const machineMap = new Map<string, MachineNode>();

  //   for (const item of items) {
  //     const machineName = item.equipment;
  //     const dateStr = item.measDate
  //       ? new Date(item.measDate as string | number | Date).toISOString().split('T')[0]
  //       : 'Unknown Date';

  //     const grade = stateToGrade[item.state] || 'A';

  //     if (!machineMap.has(machineName)) {
  //       machineMap.set(machineName, {
  //         id: `m_${item.id}`,
  //         name: machineName,
  //         highestState: 0,
  //         grade: 'A',
  //         datesMap: new Map<string, Map<string, PointData[]>>(),
  //       });
  //     }

  //     const machineNode = machineMap.get(machineName)!;
  //     if (item.state > machineNode.highestState) {
  //       machineNode.highestState = item.state;
  //       machineNode.grade = grade;
  //     }
  //     if (!machineNode.datesMap.has(dateStr)) {
  //       machineNode.datesMap.set(dateStr, new Map<string, PointData[]>());
  //     }
  //     const dateMap = machineNode.datesMap.get(dateStr)!;
  //     if (!dateMap.has(grade)) {
  //       dateMap.set(grade, []);
  //     }

  //     const bpfoNum = Number(item.bpfo) || 0;
  //     const bpfiNum = bpfoNum + 10;
  //     dateMap.get(grade)!.push({
  //       id: `${item.id}`,
  //       bpfo: bpfoNum,
  //       bpfi: bpfiNum,
  //     });
  //   }

  //   const result = Array.from(machineMap.values()).map((m: MachineNode) => {
  //     const datesArray = Array.from(m.datesMap.entries()).map(([date, statesMap]: [string, Map<string, PointData[]>]) => {
  //       const standardGrades = ['F', 'E', 'D', 'C', 'B', 'A'];
  //       const statesArray = standardGrades.map((g: string) => ({
  //         state: g,
  //         ids: statesMap.get(g) || [],
  //       }));
  //       return {
  //         date,
  //         states: statesArray,
  //       };
  //     });

  //     return {
  //       id: m.id,
  //       name: m.name,
  //       grade: m.grade,
  //       dates: datesArray,
  //     };
  //   });

  //   const countResult = await countQuery.getRawOne();
  //   const totalMachines = Number(countResult?.count) || 0;
  //   const totalPages = Math.ceil(totalMachines / limit);

  //   return {
  //     success: true,
  //     data: result,
  //     meta: {
  //       page: page,
  //       limit: limit,
  //       total: totalMachines,
  //       totalPages: totalPages
  //     }
  //   };
  // }
  async findMachineTree(dto: QueryEquipmentTreeDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 20;
    const isSearching = dto.search && dto.search.trim() !== '';

    let equipmentNames: string[] = [];
    let totalMachines = 0;

    if (isSearching) {
      if (!dto.search?.trim()) return { success: true, data: [], meta: { page, limit, total: 0, totalPages: 0 } };
      const matchedNames = await this.typesenseService.searchEquipment(dto.search, dto.site);
      totalMachines = matchedNames.length;

      if (totalMachines === 0) {
        return { success: true, data: [], meta: { page, limit, total: 0, totalPages: 0 } };
      }
      equipmentNames = matchedNames.slice((page - 1) * limit, page * limit);
    } else {
      const cacheKey = `machine_index:site_${dto.site || 'all'}:page_${page}:limit_${limit}`;
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const equipmentQb = this.repo.createQueryBuilder('m')
        .select('m.equipment', 'equipment')
        .groupBy('m.equipment')
        .orderBy('m.equipment', 'ASC');

      const countQuery = this.repo.createQueryBuilder('m')
        .select('COUNT(DISTINCT m.equipment)', 'count');

      if (dto.site && dto.site !== 'all') {
        equipmentQb.andWhere('m.site = :site', { site: dto.site });
        countQuery.andWhere('m.site = :site', { site: dto.site });
      }

      const countResult = await countQuery.getRawOne();
      totalMachines = Number(countResult?.count) || 0;

      if (totalMachines === 0) {
        return { success: true, data: [], meta: { page, limit, total: 0, totalPages: 0 } };
      }

      const paginatedEquipments = await equipmentQb
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      equipmentNames = paginatedEquipments.map((e) => e.equipment);
    }

    if (equipmentNames.length === 0) {
      return { success: true, data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }

    const qb = this.repo.createQueryBuilder('m')
      .select([
        'm.id', 'm.site', 'm.equipment', 'm.measDate', 'm.state', 'm.bpfo'
      ])
      .where('m.equipment IN (:...equipmentNames)', { equipmentNames })
      .orderBy('m.equipment', 'ASC')
      .addOrderBy('m.measDate', 'DESC');

    if (dto.site && dto.site !== 'all') {
      qb.andWhere('m.site = :site', { site: dto.site });
    }

    const items = (await qb.getMany()) as EquipmentRaw[];

    const stateToGrade: Record<number, string> = {
      1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F',
    };

    const machineMap = new Map<string, MachineNode>();

    for (const item of items) {
      const machineName = item.equipment;
      const dateStr = item.measDate ? String(item.measDate).substring(0, 10) : 'Unknown Date';
      const grade = stateToGrade[item.state] || 'A';

      if (!machineMap.has(machineName)) {
        machineMap.set(machineName, {
          id: `m_${item.id}`,
          name: machineName,
          highestState: 0,
          grade: 'A',
          datesMap: new Map<string, Map<string, PointData[]>>(),
        });
      }

      const machineNode = machineMap.get(machineName)!;
      if (item.state > machineNode.highestState) {
        machineNode.highestState = item.state;
        machineNode.grade = grade;
      }

      if (!machineNode.datesMap.has(dateStr)) {
        machineNode.datesMap.set(dateStr, new Map<string, PointData[]>());
      }
      const dateMap = machineNode.datesMap.get(dateStr)!;

      if (!dateMap.has(grade)) {
        dateMap.set(grade, []);
      }

      const bpfoNum = Number(item.bpfo) || 0;
      const bpfiNum = bpfoNum + 10;
      dateMap.get(grade)!.push({
        id: `${item.id}`,
        bpfo: bpfoNum,
        bpfi: bpfiNum,
      });
    }

    const result = Array.from(machineMap.values()).map((m: MachineNode) => {
      const datesArray = Array.from(m.datesMap.entries()).map(([date, statesMap]: [string, Map<string, PointData[]>]) => {
        const standardGrades = ['F', 'E', 'D', 'C', 'B', 'A'];
        const statesArray = standardGrades.map((g: string) => ({
          state: g,
          ids: statesMap.get(g) || [],
        }));
        return { date, states: statesArray };
      });

      return { id: m.id, name: m.name, grade: m.grade, dates: datesArray };
    });

    const totalPages = Math.ceil(totalMachines / limit);
    const finalResponse = {
      success: true,
      data: result,
      meta: { page, limit, total: totalMachines, totalPages }
    };
    if (!isSearching) {
      const cacheKey = `machine_index:site_${dto.site || 'all'}:page_${page}:limit_${limit}`;
      await this.redisService.set(cacheKey, JSON.stringify(finalResponse), 'EX', 3600);
    }
    return finalResponse;
  }

}
