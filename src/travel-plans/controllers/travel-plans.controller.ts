import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TravelPlansService } from '../services/travel-plans.service';
import { CreateTravelPlanDto } from '../dto/create-travel-plan.dto';

@Controller('travel-plans')
export class TravelPlansController {
  constructor(private readonly service: TravelPlansService) {}

  @Post()
  create(@Body() dto: CreateTravelPlanDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
