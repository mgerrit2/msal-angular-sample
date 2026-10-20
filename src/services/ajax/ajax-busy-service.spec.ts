import { TestBed } from '@angular/core/testing';

import { AjaxBusyService } from './ajax-busy-service';

describe('AjaxBusyService', () => {
  let service: AjaxBusyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AjaxBusyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
