import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TransactionDropdownComponent } from './transaction-dropdown/transaction-dropdown.component';
import { AuditTransactionFacade } from './application/services/audit-transaction.facade';
import { AuditTransactionService } from './application/services/audit-transaction.service';
import { ButtonModule } from 'primeng/button';
import { TransactionTableComponent } from './transaction-table/transaction-table/transaction-table.component';

@Component({
  selector: 'app-audit-transaction',
  standalone: true,
  imports: [
    CommonModule,
    TransactionDropdownComponent,
    ButtonModule,
    TransactionTableComponent,
  ],
  templateUrl: './feature-audit-transaction.component.html',
  styleUrl: './feature-audit-transaction.component.css',
  providers: [
    {
      useClass: AuditTransactionService,
      provide: AuditTransactionFacade,
    },
  ],
})
export class AuditTransactionComponent {
  transactionDropdownVisible: boolean = false;
}
