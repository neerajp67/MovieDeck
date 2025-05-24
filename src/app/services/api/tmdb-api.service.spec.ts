import { TestBed } from '@angular/core/testing';

import { TmdbApiService } from './tmdb-api.service';

describe('TmdbApiService', () => {
  let service: TmdbApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TmdbApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
