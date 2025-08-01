import { TestBed } from '@angular/core/testing';

import { TrailerPlayerService } from './trailer-player.service';

describe('TrailerPlayerService', () => {
  let service: TrailerPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrailerPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
