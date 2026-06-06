import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report as ReportEntity } from './entities/report.entity';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Post()
  async create(@Body() createReportDto: CreateReportDto) {
    const savedReport = await this.reportService.create(createReportDto);
    return {
      success: true,
      message: 'Report saved successfully',
      data: savedReport,
    };
  }

  @Get('by-fft/:fftId')
  async findByFftId(@Param('fftId') fftId: string) {
    return this.reportService.findByFftId(fftId);
  }

  @Get('check/:fftId')
  async checkReportExists(@Param('fftId') fftId: string) {
    const hasReport = await this.reportService.checkExists(fftId);
    return { hasReport };
  }

  @Get()
  async findAll(): Promise<ReportEntity[]> {
    return this.reportService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReportEntity> {
    return this.reportService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    const updated = await this.reportService.update(+id, updateReportDto);
    return {
      success: true,
      message: 'Report updated successfully',
      data: updated,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.reportService.remove(+id);
    return {
      success: true,
      message: `Report #${id} deleted successfully`,
    };
  }
}
