import { FormGroup } from '@angular/forms';

export abstract class AuditTransactionFacade {
  abstract transactionFilterForm: FormGroup;

  /**
   * Resets the Transaction Filer Form
   */
  abstract resetForm(): void;
}
