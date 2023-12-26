import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FetchTransactionComponent } from './fetch-transaction/fetch-transaction.component';
import { AuditTransactionFacade } from './application/services/audit-transaction.facade';
import { AuditTransactionService } from './application/services/audit-transaction.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-audit-transaction',
  standalone: true,
  imports: [CommonModule, FetchTransactionComponent, ButtonModule],
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
