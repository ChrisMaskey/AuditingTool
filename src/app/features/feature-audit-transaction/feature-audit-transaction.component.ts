import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-audit-transaction',
  standalone: true,
  imports: [ButtonModule, CommonModule],
  templateUrl: './feature-audit-transaction.component.html',
  styleUrl: './feature-audit-transaction.component.css',
})
export class AuditTransactionComponent {
  transactionDropdownVisible: boolean = false;
}
