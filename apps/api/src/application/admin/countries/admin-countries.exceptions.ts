import { NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class CountryNotFoundException extends NotFoundException {
  static readonly sample = new CountryNotFoundException(SAMPLE_UUID);

  constructor(countryId: string) {
    super({
      code: 'country_not_found',
      message: 'Country not found',
      payload: { countryId },
    });
  }
}
