import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) { }

  async create(createReportDto: CreateReportDto): Promise<Report> {
    try {
      const { envelopedFftId, ...reportData } = createReportDto;
      console.log('Received graph ID:', envelopedFftId);
      const newReport = this.reportRepository.create(reportData);
      newReport.measurement = { id: envelopedFftId } as any;
      return await this.reportRepository.save(newReport);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new ConflictException(
          'A report has already been created for this graph.',
        );
      }

      console.error('Error saving report:', error);

      throw new InternalServerErrorException(
        'Unable to save report. Please try again later.',
      );
    }
  }

  async findByFftId(fftId: string): Promise<Report | null> {
    return this.reportRepository.findOne({
      where: { envelopedFftId: fftId },
    });
  }

  async checkExists(envelopedFftId: string): Promise<boolean> {
    const count = await this.reportRepository.count({
      where: { measurement: { id: envelopedFftId } as any }
    });
    return count > 0;
  }

  async findAll({ page, limit, search }: { page: number; limit: number; search?: string }) {
    const where = search
      ? { equipmentName: Like(`%${search}%`) }
      : {};

    const [data, total] = await this.reportRepository.findAndCount({
      where,
      relations: ['measurement'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, totalItems: total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id: id.toString() },
      relations: ['measurement'],
    });

    if (!report) {
      throw new NotFoundException(`Report #${id} not found`);
    }

    return report;
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id);

    const { envelopedFftId, ...updateData } = updateReportDto;

    if (envelopedFftId) {
      report.measurement = { id: envelopedFftId } as any;
    }

    Object.assign(report, updateData);

    return this.reportRepository.save(report);
  }

  async remove(id: number): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
  }
}
