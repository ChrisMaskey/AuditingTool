import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
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
import { Subscription } from 'rxjs/internal/Subscription';
import { AddTransactionComponent } from '../add-transaction/add-transaction/add-transaction.component';

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
  ],
  providers: [DatePipe],
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

  private el = inject(ElementRef);
  protected transactionFilterForm!: FormGroup;

  isOpen: boolean = false;
  fetchTransaction: boolean | null = false;
  addModalVisible: boolean = true;
  pageSize: number = 8;
  pageNumber: number = 1;
  totalCount: number = 0;

  private bankSubscription: Subscription | undefined = new Subscription();
  private accountSubscription: Subscription | undefined = new Subscription();

  constructor(private datePipe: DatePipe) {}

  async ngOnInit(): Promise<void> {
    // Initialize the form
    this.transactionFilterForm =
      this.auditTransactionService.transactionFilterForm;

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
  }

  ngOnDestroy(): void {
    this.bankSubscription?.unsubscribe();
    this.accountSubscription?.unsubscribe();
  }

  async fetchTransactions() {
    if (this.transactionFilterForm.valid) {
      this.formatDate(this.transactionFilterForm.get('date')?.value);

      const response = await this.auditTransactionService
        .fetchTransactions(this.pageSize, this.pageNumber)
        .then((response) => {
          if (response.data !== null) {
            this.totalCount = response.data.totalCount;
            this.fetchTransaction = true;
            this.pageNumber = response.data.pageNumber;
            this.closeDropdown();
          } else {
            this.fetchTransaction = null;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      // @TODO Add reactive form validator
      alert('Invalid Form.');
    }
  }

  onPageChange(event: any) {
    this.pageNumber = event.page + 1;
    this.fetchTransactions();
  }

  resetForm() {
    this.auditTransactionService.resetForm().then(() => {
      this.fetchTransaction = false;
    });
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

  // Paginator Page Index
  calculateStartIndex() {
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  calculateEndIndex() {
    const endIndex = this.pageNumber * this.pageSize;
    return endIndex > this.totalCount ? this.totalCount : endIndex;
  }

  // Format Amount
  formatAmount(amount: number): string {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return formattedAmount;
  }

  // Format Date to MM-YYYY
  private formatDate(date: Date | string): void {
    if (typeof date === 'string') {
      const [month, year] = date.split('-');
      date = new Date(+year, +month - 1); // Months are zero-based
    }

    const formattedDate = this.datePipe.transform(date, 'MM-yyyy');
    this.transactionFilterForm.get('date')?.setValue(formattedDate);
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
