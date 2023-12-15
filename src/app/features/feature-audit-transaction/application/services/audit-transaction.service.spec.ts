import { TestBed } from '@angular/core/testing';

import { AuditTransactionService } from './audit-transaction.service';

describe('AuditTransactionService', () => {
  let service: AuditTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
