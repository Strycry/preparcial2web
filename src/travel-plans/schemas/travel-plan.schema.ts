import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const TravelPlanSchema = SchemaFactory.createForClass(TravelPlan);
