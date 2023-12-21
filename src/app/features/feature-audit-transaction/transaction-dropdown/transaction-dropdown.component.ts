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
import { Subscription } from 'rxjs/internal/Subscription';
@Component({
  selector: 'app-transaction-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
  ],
  providers: [DatePipe],
  templateUrl: './transaction-dropdown.component.html',
  styleUrl: './transaction-dropdown.component.css',
})
export class TransactionDropdownComponent implements OnInit, OnDestroy {
  private auditTransactionService: AuditTransactionFacade = inject(
    AuditTransactionFacade
  );
  protected clients$ = this.auditTransactionService.clients$;
  protected banks$ = this.auditTransactionService.banks$;
  protected accounts$ = this.auditTransactionService.accounts$;

  private el = inject(ElementRef);
  protected transactionFilterForm!: FormGroup;

  isOpen: boolean = false;
  pageSize: number = 10;
  pageNumber: number = 1;

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

  fetchTransactions() {
    if (this.transactionFilterForm.valid) {
      this.formatDate(this.transactionFilterForm.get('date')?.value);
      this.auditTransactionService.fetchTransactions(
        this.pageSize,
        this.pageNumber
      );
    } else {
      console.log('INVALID FORM');
    }
  }

  resetForm() {
    this.auditTransactionService.resetForm();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  private formatDate(date: Date) {
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
