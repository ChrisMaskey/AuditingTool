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
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TransactionType } from '../../application/entity/transaction-type.model';
import { CommonModule } from '@angular/common';
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

  @Input() addModalVisible: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();

  transactionType: TransactionType[] = [];
  transactionMode: TransactionMode[] = [];

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
  }

  async getCoa() {
    this.auditTransactionService.getCoa();
  }

  // Output to close modal
  closeModal() {
    this.closeModalEvent.emit();
  }
}
