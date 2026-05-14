import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country } from '../schemas/country.schema';
import { CountriesApiProvider } from '../providers/countries-api.provider';

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<Country>,
    private readonly apiProvider: CountriesApiProvider,
  ) {}

  async resolveCountry(alpha3: string): Promise<Country> {
    // 1. Buscar en DB (caché local)
    let country = await this.countryModel.findOne({
      alpha3: alpha3.toUpperCase(),
    });
    if (country) return country;

    // 2. Si no existe, consumir API externa
    const externalData = await this.apiProvider.fetchByAlpha3(alpha3);
    if (!externalData) throw new NotFoundException(`Código ${alpha3} no encontrado`);

    // 3. Guardar en DB para futuras solicitudes
    country = new this.countryModel(externalData);
    return country.save();
  }
}
