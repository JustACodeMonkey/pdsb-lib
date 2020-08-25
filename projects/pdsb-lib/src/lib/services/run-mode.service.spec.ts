import { TestBed } from '@angular/core/testing';

import { RunModeService } from './run-mode.service';

describe('RunModeService', () => {
  let service: RunModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
