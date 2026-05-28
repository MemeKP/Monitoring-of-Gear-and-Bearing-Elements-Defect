import { Controller, Get, Param, Query, ParseIntPipe, Post } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { QueryEquipmentTreeDto } from './dto/query-equipment-tree.dto';

@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  // /equipments/search?q=fgd
  // @Get('search')
  //  searchEquipments(
  //   @Query('q') query: string,
  //   @Query('site') site?: string,
  // ) {
  //   if (!query || query.trim() === '') {
  //     return { success: true, data: [] };
  //   }
  //   return this.equipmentsService.searchEquipmentList(query, site);
  // }

  // GET /api/v1/equipments?site=xxx&grade=F,E&sort=days_since_check&order=desc
  @Get()
  findAll(@Query() query: QueryEquipmentDto) {
    return this.equipmentsService.findAll(query);
  }

    // GET /api/v1/equipments
  @Get('machine-index')
  findMachineTree(@Query() dto: QueryEquipmentTreeDto){
    return this.equipmentsService.findMachineTree(dto)
  }

  // GET /api/v1/equipments/123
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentsService.findOne(id);
  }

  // GET /api/v1/equipments/123/history?page=1&limit=20
  // NOT IN USE
  @Get(':id/history')
  findHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.equipmentsService.findHistory(id, page, limit);
  }

  // POST /equipments/sync-typesense
  @Post('sync-typesense')
  syncToTypesense() {
    return this.equipmentsService.syncAllToTypesense();
  }
}
