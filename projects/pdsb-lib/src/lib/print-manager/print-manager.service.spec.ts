import { TestBed } from '@angular/core/testing';

import { PrintManagerService } from './print-manager.service';

describe('PrintManagerService', () => {
  let service: PrintManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
