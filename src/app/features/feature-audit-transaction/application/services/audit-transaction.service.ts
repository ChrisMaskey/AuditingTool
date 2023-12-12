import { Injectable } from '@angular/core';
import { AuditTransactionFacade } from './audit-transaction.facade';

@Injectable({
  providedIn: 'root',
})
export class AuditTransactionService implements AuditTransactionFacade {
  constructor() {}
}
