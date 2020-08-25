import { TestBed } from '@angular/core/testing';

import { ToolsService } from './tools.service';

describe('ToolService', () => {
  let service: ToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
