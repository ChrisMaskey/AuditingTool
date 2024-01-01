import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { AuditTransactionFacade } from '../../application/services/audit-transaction.facade';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TransactionType } from '../../application/entity/transaction-type.model';
import { CommonModule, DatePipe } from '@angular/common';
import { TransactionMode } from '../../application/entity/transaction-mode.model';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    ReactiveFormsModule,
    RadioButtonModule,
  ],
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.css',
})
export class AddTransactionComponent implements OnInit {
  private auditTransactionService: AuditTransactionFacade = inject(
    AuditTransactionFacade
  );

  protected addTransactionForm!: FormGroup;
  protected coa$ = this.auditTransactionService.coa$;
  protected customers$ = this.auditTransactionService.customers$;

  @Input() addModalVisible: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();

  transactionType: TransactionType[] = [];
  transactionMode: TransactionMode[] = [];

  constructor(private datePipe: DatePipe) {}

  async ngOnInit(): Promise<void> {
    this.addTransactionForm = this.auditTransactionService.addTransactionForm;
    this.getCoa();

    this.transactionType = [
      {
        type: 'Withdrawal',
        value: 1,
      },
      {
        type: 'Deposit',
        value: 0,
      },
    ];
    this.transactionMode = [
      {
        mode: 'Cash',
        value: false,
      },
      {
        mode: 'Cheque',
        value: true,
      },
    ];

    this.addTransactionForm
      .get('transactionType')
      ?.valueChanges.subscribe((value) => {
        const isEmployee = this.addTransactionForm.get('isEmployee')?.value;

        if (isEmployee && value === 1) {
          this.getCustomers(3);
        } else if (!isEmployee && value === 1) {
          this.getCustomers(1);
        } else {
          this.getCustomers(2);
        }
      });

    this.addTransactionForm
      .get('isEmployee')
      ?.valueChanges.subscribe((isEmployee) => {
        const transactionType =
          this.addTransactionForm.get('transactionType')?.value;

        if (isEmployee && transactionType === 1) {
          this.getCustomers(3);
        } else if (!isEmployee && transactionType === 1) {
          this.getCustomers(1);
        } else {
          this.getCustomers(2);
        }
      });
  }

  async getCoa() {
    await this.auditTransactionService.getCoa();
  }

  async getCustomers(customerType: number) {
    await this.auditTransactionService.getCustomers(customerType);
  }

  async addTransaction() {
    this.formatDate(this.addTransactionForm.get('date')?.value);
    this.formatPostedDate(this.addTransactionForm.get('postedDate')?.value);
    this.formatAmount(this.addTransactionForm.get('amount')?.value);

    try {
      await this.auditTransactionService.addTransaction();
      this.closeModal();
      this.addTransactionForm.reset;
    } catch (error) {
      this.addTransactionForm.invalid;
      Object.values(this.addTransactionForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      console.log(error);
    }
  }

  // Format Date to Day-Month-Year
  private formatDate(date: Date | string): void {
    const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy');
    this.addTransactionForm.get('date')?.setValue(formattedDate);
  }

  private formatPostedDate(date: Date | string): void {
    const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy');
    this.addTransactionForm.get('postedDate')?.setValue(formattedDate);
  }

  private formatAmount(amount: number): void {
    const formattedAmount = parseFloat(
      this.addTransactionForm.get('amount')?.value
    );
    this.addTransactionForm.get('amount')?.setValue(formattedAmount);
  }

  // Output to close modal
  closeModal() {
    this.closeModalEvent.emit();
  }
}
