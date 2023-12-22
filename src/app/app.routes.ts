import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'Transaction',
    loadComponent: () =>
      import(
        './features/feature-audit-transaction/feature-audit-transaction.component'
      ).then((m) => m.AuditTransactionComponent),
  },
  {
    path: 'Upload-Json',
    loadComponent: () =>
      import(
        './features/feature-upload-json/feature-upload-json.component'
      ).then((m) => m.UploadJsonComponent),
  },
];
