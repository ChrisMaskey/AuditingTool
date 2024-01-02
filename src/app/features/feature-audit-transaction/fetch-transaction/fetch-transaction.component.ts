import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuditTransactionFacade } from '../application/services/audit-transaction.facade';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs/internal/Subscription';
import { AddTransactionComponent } from '../add-transaction/add-transaction/add-transaction.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TransactionType } from '../application/entity/transaction-type.model';
import { TransactionMode } from '../application/entity/transaction-mode.model';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FetchTransaction } from '../application/entity/fetch-transaction.model';
import { ApiResponse } from '../../../interfaces/api-response-interface';
import { FetchApiResponse } from '../../../interfaces/fetch-api-response.interface';

@Component({
  selector: 'app-fetch-transaction',
  standalone: true,
  imports: [
    AddTransactionComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    TagModule,
    PaginatorModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    RadioButtonModule,
    InputTextModule,
  ],
  providers: [DatePipe, ConfirmationService, MessageService],
  templateUrl: './fetch-transaction.component.html',
  styleUrl: './fetch-transaction.component.css',
})
export class FetchTransactionComponent implements OnInit, OnDestroy {
  private auditTransactionService: AuditTransactionFacade = inject(
    AuditTransactionFacade
  );
  protected clients$ = this.auditTransactionService.clients$;
  protected banks$ = this.auditTransactionService.banks$;
  protected accounts$ = this.auditTransactionService.accounts$;
  protected transactions$ = this.auditTransactionService.transactions$;
  protected coa$ = this.auditTransactionService.coa$;
  protected customers$ = this.auditTransactionService.customers$;

  private el = inject(ElementRef);
  protected transactionFilterForm!: FormGroup;
  protected editTransactionForm!: FormGroup;

  isOpen: boolean = false;
  fetchTransaction: boolean | null = false;
  addModalVisible: boolean = false;
  editModalVisible: boolean = false;
  pageSize: number = 8;
  pageNumber: number = 1;
  totalCount: number = 0;

  transactionType: TransactionType[] = [];
  transactionMode: TransactionMode[] = [];

  private bankSubscription: Subscription | undefined = new Subscription();
  private accountSubscription: Subscription | undefined = new Subscription();

  constructor(
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  async ngOnInit(): Promise<void> {
    // Initialize the form
    this.transactionFilterForm =
      this.auditTransactionService.transactionFilterForm;
    this.editTransactionForm = this.auditTransactionService.editTransactionForm;

    // Get Clients
    this.auditTransactionService.getClients();

    //Get Banks
    this.bankSubscription = this.transactionFilterForm
      .get('clientId')
      ?.valueChanges.subscribe(() => {
        this.auditTransactionService.getBanks(
          this.transactionFilterForm.get('clientId')?.value
        );
      });

    // Get Account Numbers
    this.accountSubscription = this.transactionFilterForm
      .get('bankName')
      ?.valueChanges.subscribe(() => {
        this.auditTransactionService.getAccounts(
          this.transactionFilterForm.get('clientId')?.value,
          this.transactionFilterForm.get('bankName')?.value
        );
      });

    // Get Coa
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

    this.editTransactionForm
      .get('transactionType')
      ?.valueChanges.subscribe((value) => {
        const isEmployee = this.editTransactionForm.get('isEmployee')?.value;

        if (isEmployee && value === 1) {
          this.getCustomers(3);
        } else if (!isEmployee && value === 1) {
          this.getCustomers(1);
        } else {
          this.getCustomers(2);
        }
      });

    this.editTransactionForm
      .get('isEmployee')
      ?.valueChanges.subscribe((isEmployee) => {
        const transactionType =
          this.editTransactionForm.get('transactionType')?.value;

        if (isEmployee && transactionType === 1) {
          this.getCustomers(3);
        } else if (!isEmployee && transactionType === 1) {
          this.getCustomers(1);
        } else {
          this.getCustomers(2);
        }
      });
  }

  ngOnDestroy(): void {
    this.bankSubscription?.unsubscribe();
    this.accountSubscription?.unsubscribe();
  }

  // Fetch Transactions
  async fetchTransactions() {
    if (this.transactionFilterForm.valid) {
      this.formatDate(this.transactionFilterForm.get('date')?.value);
      const response = await this.auditTransactionService
        .fetchTransactions(this.pageSize, this.pageNumber)
        .then(
          (response: FetchApiResponse) => {
            this.totalCount = response.data.totalCount;
            this.pageNumber = response.data.pageNumber;
            this.closeDropdown();
            this.fetchTransaction = true;
          },
          (error: ApiResponse) => {
            this.fetchTransaction = null;
            console.log(error);
          }
        );
    } else {
      // @TODO Add reactive form validator
      alert('Invalid Form.');
    }
  }

  // Delete Transaction
  async deleteTransaction(transactionId: number) {
    this.auditTransactionService.deleteTransaction(transactionId).then(() => {
      this.fetchTransactions();
    });
  }

  // Edit Tranasaction
  async editTransaction() {
    this.auditTransactionService.editTransaction().then(() => {
      this.fetchTransactions();
    });
  }

  // Get COA
  async getCoa() {
    this.auditTransactionService.getCoa();
  }

  // Get Customer
  async getCustomers(customerType: number) {
    await this.auditTransactionService.getCustomers(customerType);
  }

  onPageChange(event: any) {
    this.pageNumber = event.page + 1;
    this.fetchTransactions();
  }

  resetForm() {
    this.auditTransactionService.resetForm().then(() => {});
  }

  private formatDate(date: Date | string): void {
    let parsedDate: Date;

    if (typeof date === 'string') {
      const [month, year] = date.split('-');
      parsedDate = new Date(+year, +month - 1); // Months are zero-based

      // Check if the parsed date is valid
      if (isNaN(parsedDate.getTime())) {
        return;
      }
    } else if (!(date instanceof Date)) {
      console.error('Invalid date type:', date);
      return;
    } else {
      parsedDate = date;
    }

    const formattedDate = this.datePipe.transform(parsedDate, 'MM/yyyy');
    this.transactionFilterForm.get('date')?.setValue(formattedDate);
  }

  // Format Amount
  formatAmount(amount: number): string {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return formattedAmount;
  }

  // Toggle Search Dropdown
  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  // Toggle Add Transaction Dropdown
  openAddDialog() {
    this.addModalVisible = true;
  }

  closeAddDialog() {
    this.addModalVisible = false;
  }

  // Toggle Edit Transaction Dropdown
  openEditDialog(transaction: FetchTransaction) {
    this.editTransactionForm.patchValue({
      transactionId: transaction.id,
      date: transaction.date,
      coa: transaction.coa,
      transactionType: transaction.transactionType,
      isEmployee: transaction.isEmployee,
      customerId: transaction.customerId,
      isCheque: transaction.isCheque,
      amount: transaction.amount,
      chequeNumber: transaction.chequeNumber,
      postedDate: transaction.postedDate,
    });
    console.log(this.editTransactionForm.get('coa')?.value);

    console.log(this.editTransactionForm.value);

    this.editModalVisible = true;
  }

  closeEditDialog() {
    this.editModalVisible = false;
  }

  // Change color of chip
  getTransactionSeverity(status: string): 'success' | 'warning' | undefined {
    switch (status) {
      case 'Deposit':
        return 'success';
      case 'Withdrawal':
        return 'warning';
      default:
        return undefined;
    }
  }

  getEmployeeSeverity(status: boolean): 'success' | 'warning' | undefined {
    switch (status) {
      case true:
        return 'success';
      case false:
        return 'warning';
      default:
        return undefined;
    }
  }

  getModeSeverity(status: string): 'success' | 'warning' | undefined {
    switch (status) {
      case 'Cash':
        return 'success';
      case 'Cheque':
        return 'warning';
      default:
        return undefined;
    }
  }

  confirm1(transactionId: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to delete this?',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        try {
          this.deleteTransaction(transactionId).then(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Transaction deleted',
            });
          });
        } catch (error) {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete transaction',
          });
        }
      },
    });
  }

  // Paginator Page Index
  calculateStartIndex() {
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  calculateEndIndex() {
    const endIndex = this.pageNumber * this.pageSize;
    return endIndex > this.totalCount ? this.totalCount : endIndex;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
