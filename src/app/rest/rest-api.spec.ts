import { TestBed } from '@angular/core/testing';

import { RestApi } from './rest-api';

describe('RestApi', () => {
  let service: RestApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
