import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Expense {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;
}

@Schema({ timestamps: true })
export class TravelPlan extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, ref: 'Country' })
  countryAlpha3: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: [Object], default: [] })
  expenses: Expense[];
}

export const TravelPlanSchema = SchemaFactory.createForClass(TravelPlan);
