import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Country, CountrySchema } from './schemas/country.schema';
import { CountriesService } from './services/countries.service';
import { CountriesApiProvider } from './providers/countries-api.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    HttpModule,
  ],
  providers: [CountriesService, CountriesApiProvider],
  exports: [CountriesService], // ÚNICO que se exporta
})
export class CountriesModule {}
