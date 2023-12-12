import { Routes } from '@angular/router';
import { AuditTransactionComponent } from './features/feature-audit-transaction/feature-audit-transaction.component';
import { UploadJsonComponent } from './features/feature-upload-json/feature-upload-json.component';

export const routes: Routes = [
  { path: 'Transaction', component: AuditTransactionComponent },
  { path: 'Upload-Json', component: UploadJsonComponent },
];
