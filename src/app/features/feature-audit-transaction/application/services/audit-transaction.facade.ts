import { FormGroup } from '@angular/forms';

export abstract class AuditTransactionFacade {
  abstract transactionFilterForm: FormGroup;

  /**
   * Resets the Transaction Filter Form
   */
  abstract resetForm(): void;
}
