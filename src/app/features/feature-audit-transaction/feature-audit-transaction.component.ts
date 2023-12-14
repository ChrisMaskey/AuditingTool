import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TransactionDropdownComponent } from './transaction-dropdown/transaction-dropdown.component';

@Component({
  selector: 'app-audit-transaction',
  standalone: true,
  imports: [ButtonModule, CommonModule, TransactionDropdownComponent],
  templateUrl: './feature-audit-transaction.component.html',
  styleUrl: './feature-audit-transaction.component.css',
})
export class AuditTransactionComponent {
  transactionDropdownVisible: boolean = false;
}
