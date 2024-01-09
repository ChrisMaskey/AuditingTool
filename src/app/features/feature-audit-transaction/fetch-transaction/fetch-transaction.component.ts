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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TransactionType } from '../application/entity/transaction-type.model';
import { TransactionMode } from '../application/entity/transaction-mode.model';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FetchTransaction } from '../application/entity/fetch-transaction.model';
import { ApiResponse } from '../../../interfaces/api-response-interface';
import { FetchApiResponse } from '../../../interfaces/fetch-api-response.interface';
import { Observable, debounceTime, map } from 'rxjs';

@Component({
  selector: 'app-fetch-transaction',
  standalone: true,
  imports: [
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
  protected addTransactionForm!: FormGroup;
  protected editTransactionForm!: FormGroup;

  isOpen: boolean = false;
  fetchTransaction: boolean | null = false;
  addModalVisible: boolean = false;
  editModalVisible: boolean = false;
  pageSize: number = 8;
  pageNumber: number = 1;
  totalCount: number = 0;
  maxDate!: Date;
  minDate!: Date;
  defaultDate!: Date;
  transactionType: TransactionType[] = [];
  transactionMode: TransactionMode[] = [];

  private bankSubscription: Subscription | undefined = new Subscription();
  private accountSubscription: Subscription | undefined = new Subscription();
  private coabyId: Subscription | undefined = new Subscription();

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
    this.addTransactionForm = this.auditTransactionService.addTransactionForm;

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

    this.addTransactionForm
      .get('transactionType')
      ?.valueChanges.subscribe(() => {
        if (this.addTransactionForm.get('transactionType')?.value === 0) {
          this.addTransactionForm.get('isEmployee')?.patchValue(false);
        }
      });
    this.editTransactionForm
      .get('transactionType')
      ?.valueChanges.subscribe(() => {
        if (this.editTransactionForm.get('transactionType')?.value === 0) {
          this.editTransactionForm.get('isEmployee')?.patchValue(false);
        }
      });

    this.subscribeToFormChanges(this.addTransactionForm);
    this.subscribeToFormChanges(this.editTransactionForm, true);

    this.transactionFilterForm
      .get('date')
      ?.valueChanges.subscribe((date: string) => {
        if (date) {
          const [month, year] = date.split('/');
          const firstDayOfMonth = new Date(
            parseInt(year),
            parseInt(month) - 1,
            1
          );

          const lastDayOfMonth = new Date(parseInt(year), parseInt(month), 0);

          // Set the minDate and maxDate based on the selected month
          this.minDate = firstDayOfMonth;
          this.maxDate = lastDayOfMonth;
          this.defaultDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        }
      });
  }

  ngOnDestroy(): void {
    this.bankSubscription?.unsubscribe();
    this.accountSubscription?.unsubscribe();
  }

  // feat : Confirmation and addition to display when any value is selected.
  isAnyDropdownSelected(): boolean {
    return (
      this.transactionFilterForm.get('clientId')?.value ||
      this.transactionFilterForm.get('bankName')?.value ||
      this.transactionFilterForm.get('accountNumber')?.value ||
      this.transactionFilterForm.get('date')?.value
    );
  }

  // feature : Extract legalName from provided ID when selecting dropdown name
  getLegalName(id: number): Observable<string | null> {
    return this.clients$.pipe(
      map((clients) => {
        const selectedName = clients.find((client) => client.id === id);
        return selectedName ? selectedName.legalName : null;
      })
    );
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

  // Add Transaction
  async addTransaction() {
    this.formatAddDate(this.addTransactionForm.get('date')?.value);
    this.formatAddPostedDate(this.addTransactionForm.get('postedDate')?.value);
    parseFloat(this.addTransactionForm.get('amount')?.value);
    try {
      if (
        this.addTransactionForm.valid &&
        this.addTransactionForm.get('amount')?.value !== '' &&
        this.addTransactionForm.get('amount')?.value !== null
      ) {
        await this.auditTransactionService.addTransaction().then(() => {
          this.closeAddDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Transaction Added',
          });
        });
        this.fetchTransactions();
      } else {
        Object.values(this.addTransactionForm.controls).forEach((control) => {
          if (control.markAsTouched) {
            control.markAsTouched();
          }
        });
      }
    } catch (error) {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add transaction',
      });
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
    this.formatEditDate(this.editTransactionForm.get('date')?.value);
    this.formatEditPostedDate(
      this.editTransactionForm.get('postedDate')?.value
    );

    if (this.editTransactionForm.get('isCheque')?.value === false) {
      this.editTransactionForm.get('chequeNumber')?.patchValue(null);
      this.editTransactionForm.get('postedDate')?.patchValue('');
    }

    if (this.editTransactionForm.valid) {
      this.auditTransactionService.editTransaction().then(() => {
        this.fetchTransactions();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Transaction Successfully Updated',
        });
        this.closeEditDialog();
      });
    } else {
      Object.values(this.editTransactionForm.controls).forEach((control) => {
        if (control.value === '' && control.markAsTouched) {
          control.markAsTouched();
        }
      });
    }
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
    this.auditTransactionService.resetForm().then(() => {
      this.fetchTransaction = false;
      this.coabyId?.unsubscribe();
    });
  }

  protected formatDate(date: Date | string): void {
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

  // FOR EDIT
  private formatEditDate(date: Date | string): void {
    let formattedDate: string;

    if (date instanceof Date) {
      // If it's a Date object, format it using DatePipe
      formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    } else if (typeof date === 'string') {
      // If it's a string, assume it's already in the correct format
      formattedDate = date;
    } else {
      return;
    }

    this.editTransactionForm.get('date')?.setValue(formattedDate);
  }

  private formatEditPostedDate(date: Date | string): void {
    let formattedDate: string;

    if (date instanceof Date) {
      // If it's a Date object, format it using DatePipe
      formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    } else if (typeof date === 'string') {
      // If it's a string, assume it's already in the correct format
      formattedDate = date;
    } else {
      return;
    }
    this.editTransactionForm.get('postedDate')?.setValue(formattedDate);
  }

  // FOR ADD
  private formatAddDate(date: Date | string): void {
    let formattedDate: string;

    if (date instanceof Date) {
      // If it's a Date object, format it using DatePipe
      formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    } else if (typeof date === 'string') {
      // If it's a string, assume it's already in the correct format
      formattedDate = date;
    } else {
      return;
    }

    this.addTransactionForm.get('date')?.setValue(formattedDate);
  }

  private formatAddPostedDate(date: Date | string): void {
    let formattedDate: string;

    if (date instanceof Date) {
      // If it's a Date object, format it using DatePipe
      formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    } else if (typeof date === 'string') {
      // If it's a string, assume it's already in the correct format
      formattedDate = date;
    } else {
      return;
    }
    this.addTransactionForm.get('postedDate')?.setValue(formattedDate);
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

  async closeAddDialog() {
    this.auditTransactionService.resetAddForm();
    this.addModalVisible = false;
  }

  getCoaId(name: string): Observable<number | null> {
    return this.coa$.pipe(
      map((coa) => {
        const selectedCoa = coa.find((coa) => coa.coa === name);
        return selectedCoa ? selectedCoa.id : null;
      })
    );
  }

  // Toggle Edit Transaction Dropdown
  openEditDialog(transaction: FetchTransaction) {
    this.coabyId = this.getCoaId(transaction.coa).subscribe((id) => {
      this.editTransactionForm.get('coa')?.patchValue(id);
    });
    this.editTransactionForm.patchValue({
      transactionId: transaction.id,
      date: transaction.date,
      transactionType: transaction.transactionType === 'Deposit' ? 0 : 1,
      isEmployee: transaction.isEmployee,
      customerId: transaction.customerId,
      isCheque: transaction.isCheque,
      amount: transaction.amount,
      chequeNumber: transaction.chequeNumber,
      postedDate: transaction.postedDate,
    });

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

  private handleFormChanges(form: FormGroup): void {
    const transactionType = form.get('transactionType')!.value;
    const isEmployee = form.get('isEmployee')!.value;
    let customerType: number;

    if (transactionType === 1 && isEmployee !== null) {
      customerType = isEmployee ? 3 : 1;
      this.getCustomers(customerType);
    } else if (transactionType === 0) {
      customerType = 2;
      this.getCustomers(customerType);
    }
  }

  // Subscribe to value changes in forms and call the appropriate handler
  private subscribeToFormChanges(form: FormGroup, editMode = false): void {
    const handler = this.handleFormChanges.bind(this);

    form
      .get('transactionType')
      ?.valueChanges.pipe(
        debounceTime(300) // Adjust the debounce time as needed
      )
      .subscribe(() => {
        if (form.get('transactionType')?.value === 0) {
          form.get('isEmployee')?.patchValue(false);
        }
        handler(form);
      });

    form
      .get('isEmployee')
      ?.valueChanges.pipe(
        debounceTime(300) // Adjust the debounce time as needed
      )
      .subscribe(() => {
        handler(form);
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

  allowOnlyNumbers(event: KeyboardEvent, input: HTMLInputElement) {
    const allowedChars = /[0-9.]/;

    // Allow deletion with Backspace or Delete keys
    if (event.key === 'Backspace' || event.key === 'Delete') {
      return; // Allow deletion
    }

    if (!allowedChars.test(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyNumbersCheque(event: KeyboardEvent, input: HTMLInputElement) {
    const allowedChars = /[0-9]/;

    // Allow deletion with Backspace or Delete keys
    if (event.key === 'Backspace' || event.key === 'Delete') {
      return; // Allow deletion
    }

    if (!allowedChars.test(event.key)) {
      event.preventDefault();
    }
  }
}
