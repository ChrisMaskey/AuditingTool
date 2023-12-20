import { CommonModule } from '@angular/common';
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
  date: Date | undefined;
  cities: any[] | undefined;

  private bankSubscription: Subscription | undefined = new Subscription();
  private accountSubscription: Subscription | undefined = new Subscription();

  constructor() {}

  async ngOnInit(): Promise<void> {
    // Initialize the form
    this.transactionFilterForm =
      this.auditTransactionService.transactionFilterForm;

    // Get Clients
    this.auditTransactionService.getClients();

    // Get Banks
    this.bankSubscription = this.transactionFilterForm
      .get('client')
      ?.valueChanges.subscribe((selectedClient) => {
        if (selectedClient) {
          this.auditTransactionService.getBanks(selectedClient.id);
        } else {
          this.transactionFilterForm.get('bank')?.patchValue(null);
          this.auditTransactionService.clearBanks();
        }
      });

    // Get Accounts
    this.accountSubscription = this.transactionFilterForm
      .get('bank')
      ?.valueChanges.subscribe((selectedClient) => {
        if (selectedClient) {
          this.auditTransactionService.getAccounts(
            selectedClient.clientId,
            selectedClient.bankName
          );
        } else {
          this.transactionFilterForm.get('accountNumber')?.patchValue(null);
          this.auditTransactionService.clearAccounts();
        }
      });
  }

  ngOnDestroy(): void {
    this.bankSubscription?.unsubscribe();
    this.accountSubscription?.unsubscribe();
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

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
