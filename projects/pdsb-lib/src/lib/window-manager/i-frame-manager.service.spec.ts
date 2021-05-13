import { TestBed } from '@angular/core/testing';

import { IFrameManagerService } from './i-frame-manager.service';

describe('IFrameManagerService', () => {
  let service: IFrameManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IFrameManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
