import { Injectable, inject } from '@angular/core';
import { AuditTransactionFacade } from './audit-transaction.facade';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class AuditTransactionService implements AuditTransactionFacade {
  private formBuilder = inject(FormBuilder);
  private requiredValidator = Validators.required;

  public transactionFilterForm!: FormGroup;

  constructor() {
    this.initTransactionFilterForm();
  }

  private initTransactionFilterForm(): void {
    this.transactionFilterForm = this.formBuilder.group({
      client: ['', this.requiredValidator],
      bank: ['', this.requiredValidator],
      accountNumber: ['', this.requiredValidator],
      date: ['', this.requiredValidator],
    });
  }

  public resetForm(): void {
    this.transactionFilterForm.reset();
  }
}
