import { Component, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-audit-transaction',
  standalone: true,
  imports: [MenubarModule],
  templateUrl: './feature-audit-transaction.component.html',
  styleUrl: './feature-audit-transaction.component.css',
})
export class AuditTransactionComponent {}
