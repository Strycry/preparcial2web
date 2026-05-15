import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelPlan } from '../schemas/travel-plan.schema';
import { CreateTravelPlanDto } from '../dto/create-travel-plan.dto';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { CountriesService } from '../../countries/services/countries.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class TravelPlansService {
  constructor(
    @InjectModel(TravelPlan.name) private planModel: Model<TravelPlan>,
    private readonly countriesService: CountriesService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateTravelPlanDto) {
    await this.usersService.findOne(dto.userId);
    await this.countriesService.resolveCountry(dto.countryAlpha3);

    const plan = new this.planModel({
      title: dto.title,
      startDate: dto.startDate,
      endDate: dto.endDate,
      countryAlpha3: dto.countryAlpha3,
      userId: dto.userId,
      expenses: [],
    });

    return plan.save();
  }

  findAll() {
    return this.planModel.find().lean();
  }

  findOne(id: string) {
    return this.planModel.findById(id).lean();
  }

  async addExpense(id: string, expense: CreateExpenseDto) {
    const plan = await this.planModel.findByIdAndUpdate(
      id,
      { $push: { expenses: expense } },
      { new: true },
    );

    if (!plan) {
      throw new NotFoundException(`Travel plan con id ${id} no encontrado`);
    }

    return plan;
  }

  remove(id: string) {
    return this.planModel.findByIdAndDelete(id);
  }
}
