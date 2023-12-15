import { TestBed } from '@angular/core/testing';

import { UploadJsonService } from './upload-json.service';

describe('UploadJsonService', () => {
  let service: UploadJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
