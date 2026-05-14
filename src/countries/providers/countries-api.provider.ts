import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CountriesApiProvider {
  constructor(private readonly http: HttpService) {}

  async fetchByAlpha3(alpha3: string) {
    const url = `https://restcountries.com/v3.1/alpha/${alpha3}`;
    const response = await firstValueFrom(this.http.get(url));
    const data = response.data[0];
    return {
      alpha3: data.cca3,
      name: data.name.common,
      region: data.region,
      capital: data.capital?.[0] ?? 'Desconocida',
      population: data.population,
      flagUrl: data.flags?.png ?? '',
    };
  }
}
