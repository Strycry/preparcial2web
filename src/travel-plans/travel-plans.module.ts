import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlan, TravelPlanSchema } from './schemas/travel-plan.schema';
import { TravelPlansService } from './services/travel-plans.service';
import { TravelPlansController } from './controllers/travel-plans.controller';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TravelPlan.name, schema: TravelPlanSchema }]),
    CountriesModule,
  ],
  controllers: [TravelPlansController],
  providers: [TravelPlansService],
})
export class TravelPlansModule {}
