import { IsString, IsDateString, Matches, IsNotEmpty } from 'class-validator';

export class CreateTravelPlanDto {
  @IsString()
  @IsNotEmpty()
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

  @IsString()
  @IsNotEmpty()
  userId: string;
}
