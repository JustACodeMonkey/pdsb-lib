import { TestBed } from '@angular/core/testing';

import { InactivityManagerService } from './inactivity-manager.service';

describe('InactivityManagerService', () => {
  let service: InactivityManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InactivityManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
