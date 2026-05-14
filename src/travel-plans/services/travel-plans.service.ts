import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelPlan } from '../schemas/travel-plan.schema';
import { CreateTravelPlanDto } from '../dto/create-travel-plan.dto';
import { CountriesService } from '../../countries/services/countries.service';

@Injectable()
export class TravelPlansService {
  constructor(
    @InjectModel(TravelPlan.name) private planModel: Model<TravelPlan>,
    private readonly countriesService: CountriesService,
  ) {}

  async create(dto: CreateTravelPlanDto) {
    // 1. Resolver país (caché o API externa)
    await this.countriesService.resolveCountry(dto.countryAlpha3);

    // 2. Guardar plan
    const plan = new this.planModel(dto);
    return plan.save();
  }

  findAll() {
    return this.planModel.find().lean();
  }

  findOne(id: string) {
    return this.planModel.findById(id).lean();
  }

  remove(id: string) {
    return this.planModel.findByIdAndDelete(id);
  }
}
