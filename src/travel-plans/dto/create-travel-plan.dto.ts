import { IsString, IsDateString, Matches } from 'class-validator';

export class CreateTravelPlanDto {
  @IsString()
  title: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/)
  countryAlpha3: string;
}
