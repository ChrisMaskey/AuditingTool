import { Injectable, inject } from '@angular/core';
import { AuditTransactionFacade } from './audit-transaction.facade';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class AuditTransactionService implements AuditTransactionFacade {
  private formBuilder = inject(FormBuilder);
  private requiredValidator = inject(Validators.required);

  public transactionFilterForm!: FormGroup;

  constructor() {
    this.initTransactionFilterForm();
  }

  private initTransactionFilterForm(): void {
    this.transactionFilterForm = this.formBuilder.group({
      clientName: ['', this.requiredValidator],
      bankName: ['', this.requiredValidator],
      accNumber: ['', this.requiredValidator],
      date: ['', this.requiredValidator],
    });
  }

  public resetForm(): void {
    this.transactionFilterForm.reset();
  }
}
