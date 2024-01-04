// import {
//   Component,
//   EventEmitter,
//   Input,
//   OnInit,
//   Output,
//   inject,
// } from '@angular/core';
// import { CalendarModule } from 'primeng/calendar';
// import { DialogModule } from 'primeng/dialog';
// import { DropdownModule } from 'primeng/dropdown';
// import { AuditTransactionFacade } from '../../application/services/audit-transaction.facade';
// import { FormGroup, ReactiveFormsModule } from '@angular/forms';
// import { InputTextModule } from 'primeng/inputtext';
// import { RadioButtonModule } from 'primeng/radiobutton';
// import { ToastModule } from 'primeng/toast';
// import { TransactionType } from '../../application/entity/transaction-type.model';
// import { CommonModule, DatePipe } from '@angular/common';
// import { TransactionMode } from '../../application/entity/transaction-mode.model';
// import { MessageService } from 'primeng/api';

// @Component({
//   selector: 'app-add-transaction',
//   standalone: true,
//   imports: [
//     CommonModule,
//     DialogModule,
//     DropdownModule,
//     CalendarModule,
//     InputTextModule,
//     ReactiveFormsModule,
//     RadioButtonModule,
//     ToastModule,
//   ],
//   providers: [DatePipe, MessageService],
//   templateUrl: './add-transaction.component.html',
//   styleUrl: './add-transaction.component.css',
// })
// export class AddTransactionComponent implements OnInit {
//   private auditTransactionService: AuditTransactionFacade = inject(
//     AuditTransactionFacade
//   );

//   protected addTransactionForm!: FormGroup;
//   protected coa$ = this.auditTransactionService.coa$;
//   protected customers$ = this.auditTransactionService.customers$;

//   @Input() addModalVisible: boolean = false;
//   @Output() closeModalEvent = new EventEmitter<void>();

//   transactionType: TransactionType[] = [];
//   transactionMode: TransactionMode[] = [];

//   maxDate: Date = new Date();

//   constructor(
//     private datePipe: DatePipe,
//     private messageService: MessageService
//   ) {}

//   async ngOnInit(): Promise<void> {
//     this.addTransactionForm = this.auditTransactionService.addTransactionForm;
//     this.getCoa();

//     this.transactionType = [
//       {
//         type: 'Withdrawal',
//         value: 1,
//       },
//       {
//         type: 'Deposit',
//         value: 0,
//       },
//     ];
//     this.transactionMode = [
//       {
//         mode: 'Cash',
//         value: false,
//       },
//       {
//         mode: 'Cheque',
//         value: true,
//       },
//     ];

//     this.addTransactionForm
//       .get('transactionType')
//       ?.valueChanges.subscribe(() => {
//         this.handleFormChanges();
//       });

//     this.addTransactionForm.get('isEmployee')?.valueChanges.subscribe(() => {
//       this.handleFormChanges();
//     });
//   }

//   async getCoa() {
//     await this.auditTransactionService.getCoa();
//   }

//   async getCustomers(customerType: number) {
//     await this.auditTransactionService.getCustomers(customerType);
//   }

//   async addTransaction() {
//     this.formatDate(this.addTransactionForm.get('date')?.value);
//     this.formatPostedDate(this.addTransactionForm.get('postedDate')?.value);
//     console.log(
//       this.addTransactionForm.get('date')?.value +
//         this.addTransactionForm.get('postedDate')?.value
//     );

//     this.formatAmount(this.addTransactionForm.get('amount')?.value);
//     try {
//       if (this.addTransactionForm.valid) {
//         await this.auditTransactionService.addTransaction().then(() => {
//           this.closeModal();
//           this.addTransactionForm.reset;
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Success',
//             detail: 'Transaction Added',
//           });
//         });
//       } else {
//         this.addTransactionForm.invalid;
//         Object.values(this.addTransactionForm.controls).forEach((control) => {
//           control.markAsTouched();
//         });
//       }
//     } catch (error) {
//       console.log(error);
//       this.messageService.add({
//         severity: 'error',
//         summary: 'Error',
//         detail: 'Failed to add transaction',
//       });
//     }
//   }

//   // Format Date to Day-Month-Year
//   // private formatDate(date: Date | string): void {
//   //   const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy');
//   //   this.addTransactionForm.get('date')?.setValue(formattedDate);
//   // }

//   // private formatPostedDate(date: Date | string): void {
//   //   const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy');
//   //   this.addTransactionForm.get('postedDate')?.setValue(formattedDate);
//   // }

//   private formatDate(date: Date | string): void {
//     let parsedDate: Date;

//     if (typeof date === 'string') {
//       const [month, year] = date.split('-');
//       parsedDate = new Date(+year, +month - 1); // Months are zero-based

//       // Check if the parsed date is valid
//       if (isNaN(parsedDate.getTime())) {
//         return;
//       }
//     } else if (!(date instanceof Date)) {
//       console.error('Invalid date type:', date);
//       return;
//     } else {
//       parsedDate = date;
//     }

//     const formattedDate = this.datePipe.transform(parsedDate, 'dd/MM/yyyy');
//     this.addTransactionForm.get('date')?.setValue(formattedDate);
//   }

//   private formatPostedDate(date: Date | string): void {
//     let parsedDate: Date;

//     if (typeof date === 'string') {
//       const [month, year] = date.split('-');
//       parsedDate = new Date(+year, +month - 1); // Months are zero-based

//       // Check if the parsed date is valid
//       if (isNaN(parsedDate.getTime())) {
//         return;
//       }
//     } else if (!(date instanceof Date)) {
//       console.error('Invalid date type:', date);
//       return;
//     } else {
//       parsedDate = date;
//     }

//     const formattedDate = this.datePipe.transform(parsedDate, 'dd/MM/yyyy');
//     this.addTransactionForm.get('postedDate')?.setValue(formattedDate);
//   }

//   private formatAmount(amount: number): void {
//     const formattedAmount = parseFloat(
//       this.addTransactionForm.get('amount')?.value
//     );
//     this.addTransactionForm.get('amount')?.setValue(formattedAmount);
//   }

//   // Output to close modal
//   closeModal() {
//     this.closeModalEvent.emit();
//   }

//   // Handle value changes
//   handleFormChanges = () => {
//     const transactionType =
//       this.addTransactionForm.get('transactionType')?.value;
//     const isEmployee = this.addTransactionForm.get('isEmployee')?.value;
//     if (isEmployee && transactionType === 1) {
//       this.getCustomers(3);
//     } else if (!isEmployee && transactionType === 1) {
//       this.getCustomers(1);
//     } else {
//       this.getCustomers(2);
//     }
//   };
// }
