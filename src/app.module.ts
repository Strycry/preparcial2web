import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlansModule } from './travel-plans/travel-plans.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/travel-plans-db'),
    TravelPlansModule,
  ],
})
export class AppModule {}
