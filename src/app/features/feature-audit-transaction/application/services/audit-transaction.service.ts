import { Injectable, inject } from '@angular/core';
import { AuditTransactionFacade } from './audit-transaction.facade';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  ADD_TRANSCTIONS,
  DELETE_TRANSACTIONS,
  EDIT_TRANSACTIONS,
  FETCH_TRANSACTIONS,
  GET_ACCOUNT_NUMBERS,
  GET_BANKS,
  GET_CLIENTS,
  GET_COA,
  GET_CUSTOMER,
} from '../../../../interfaces/Urls';
import { BehaviorSubject, map } from 'rxjs';
import { Client } from '../entity/client.model';
import { ApiResponse } from '../../../../interfaces/api-response-interface';
import { HttpClient } from '@angular/common/http';
import { Bank } from '../entity/bank.model';
import { AccountNumber } from '../entity/account-number.model';
import { FetchApiResponse } from '../../../../interfaces/fetch-api-response.interface';
import { FetchTransaction } from '../entity/fetch-transaction.model';
import { Coa } from '../entity/coa.model';
import { Customer } from '../entity/customer.model';

@Injectable()
export class AuditTransactionService implements AuditTransactionFacade {
  private http = inject(HttpClient);

  private clientSubject = new BehaviorSubject<Client[]>([]);
  clients$ = this.clientSubject.asObservable();

  private bankSubject = new BehaviorSubject<Bank[]>([]);
  banks$ = this.bankSubject.asObservable();

  private accountNumberSubject = new BehaviorSubject<AccountNumber[]>([]);
  accounts$ = this.accountNumberSubject.asObservable();

  private coaSubject = new BehaviorSubject<Coa[]>([]);
  coa$ = this.coaSubject.asObservable();

  private customerSubject = new BehaviorSubject<Customer[]>([]);
  customers$ = this.customerSubject.asObservable();

  private transactionSubject = new BehaviorSubject<FetchTransaction[]>([]);
  transactions$ = this.transactionSubject.asObservable();

  statementId!: number;

  private formBuilder = inject(FormBuilder);
  private requiredValidator = Validators.required;

  public transactionFilterForm!: FormGroup;
  public addTransactionForm!: FormGroup;
  public editTransactionForm!: FormGroup;

  formControlName: string = '';

  constructor() {
    this.initTransactionFilterForm();
    this.initAddTransactionForm();
    this.initEditTransactionForm();
  }

  private initTransactionFilterForm(): void {
    this.transactionFilterForm = this.formBuilder.group({
      clientId: ['', this.requiredValidator],
      bankName: ['', this.requiredValidator],
      accountNumber: ['', this.requiredValidator],
      date: ['', this.requiredValidator],
      filterParams: this.formBuilder.group({
        date: [''],
        transactionMode: [null],
        name: [null],
        coa: [null],
        chequeNumber: [null],
        transactionType: [null],
        isEmployee: [null],
        postedDate: [''],
        amount: [null],
        tradeType: [null],
      }),
    });
  }

  private initAddTransactionForm(): void {
    this.addTransactionForm = this.formBuilder.group({
      statementId: ['', this.requiredValidator],
      date: ['', this.requiredValidator],
      transactionType: ['', this.requiredValidator],
      customerId: [null, this.requiredValidator],
      isEmployee: [null, this.requiredValidator],
      coa: ['', this.requiredValidator],
      isCheque: ['', this.requiredValidator],
      chequeNumber: [null, [this.requiredValidator, chequeNumberValidator]],
      postedDate: [null, this.requiredValidator],
      amount: [null, this.requiredValidator],
    });

    // Add conditional validators for chequeNumber, postedDate, and amount
    const chequeNumberControl = this.addTransactionForm.get('chequeNumber');
    const postedDateControl = this.addTransactionForm.get('postedDate');
    const amountControl = this.addTransactionForm.get('amount');

    this.addTransactionForm
      .get('isCheque')
      ?.valueChanges.subscribe((isCheque: boolean) => {
        if (isCheque) {
          chequeNumberControl?.setValidators([this.requiredValidator]);
          postedDateControl?.setValidators([this.requiredValidator]);
          amountControl?.setValidators([this.requiredValidator]);
        } else {
          chequeNumberControl?.setValidators(null);
          postedDateControl?.setValidators(null);
          amountControl?.setValidators(null);
        }

        // Update the validation state
        chequeNumberControl?.updateValueAndValidity();
        postedDateControl?.updateValueAndValidity();
        amountControl?.updateValueAndValidity();
      });
  }

  private initEditTransactionForm(): void {
    this.editTransactionForm = this.formBuilder.group({
      statementId: ['', this.requiredValidator],
      transactionId: ['', this.requiredValidator],
      date: ['', this.requiredValidator],
      transactionType: ['', this.requiredValidator],
      customerId: [null, this.requiredValidator],
      isEmployee: [null, this.requiredValidator],
      coa: ['', this.requiredValidator],
      isCheque: ['', this.requiredValidator],
      chequeNumber: ['', [this.requiredValidator, chequeNumberValidator]],
      postedDate: ['', this.requiredValidator],
      amount: ['', this.requiredValidator],
    });

    // Add conditional validators for chequeNumber, postedDate, and amount
    const chequeNumberControl = this.editTransactionForm.get('chequeNumber');
    const postedDateControl = this.editTransactionForm.get('postedDate');
    const amountControl = this.editTransactionForm.get('amount');

    this.editTransactionForm
      .get('isCheque')
      ?.valueChanges.subscribe((isCheque: boolean) => {
        if (isCheque) {
          chequeNumberControl?.setValidators([this.requiredValidator]);
          postedDateControl?.setValidators([this.requiredValidator]);
          amountControl?.setValidators([this.requiredValidator]);
        } else {
          chequeNumberControl?.setValidators(null);
          postedDateControl?.setValidators(null);
          amountControl?.setValidators(null);
        }

        // Update the validation state
        chequeNumberControl?.updateValueAndValidity();
        postedDateControl?.updateValueAndValidity();
        amountControl?.updateValueAndValidity();
      });
  }

  public resetForm(): Promise<void> {
    return new Promise((resolve) => {
      this.transactionFilterForm.reset();
      resolve();
    });
  }

  public resetAddForm(): Promise<void> {
    return new Promise((resolve) => {
      this.addTransactionForm.reset();
      this.addTransactionForm
        .get('statementId')
        ?.setValue(this.getStatementId());
      this.addTransactionForm.get('isEmployee')?.setValue(null);
      this.addTransactionForm.get('amount')?.setValue(null);
      this.addTransactionForm.get('customerId')?.setValue(null);
      resolve();
    });
  }

  async getClients(): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.http
        .get<ApiResponse>(GET_CLIENTS)
        .pipe(map((response: ApiResponse) => response.data as Client[]))
        .subscribe({
          next: (clients: Client[]) => {
            this.clientSubject.next(clients);
            resolve();
          },
          error: (err) => {
            this.clientSubject.next([]);
            reject(err);
          },
        });
    });
  }

  async getBanks(clientId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.http
        .get<ApiResponse>(GET_BANKS(clientId))
        .pipe(map((response: ApiResponse) => response.data as Bank[]))
        .subscribe({
          next: (banks: Bank[]) => {
            this.bankSubject.next(banks);
            resolve();
          },
          error: (err) => {
            this.bankSubject.next([]);
            reject(err);
          },
        });
    });
  }

  async getAccounts(clientId: number, bankName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.http
        .get<ApiResponse>(GET_ACCOUNT_NUMBERS(clientId, bankName))
        .pipe(map((response: ApiResponse) => response.data as AccountNumber[]))
        .subscribe({
          next: (accounts: AccountNumber[]) => {
            this.accountNumberSubject.next(accounts);
            resolve();
          },
          error: (err) => {
            this.accountNumberSubject.next([]);
            reject(err);
          },
        });
    });
  }

  async getCoa(): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.http
        .get<ApiResponse>(GET_COA)
        .pipe(map((response: ApiResponse) => response.data as Coa[]))
        .subscribe({
          next: (coa: Coa[]) => {
            this.coaSubject.next(coa);
            resolve();
          },
          error: (error) => {
            this.coaSubject.next([]);
            reject(error);
          },
        });
    });
  }

  getCustomers(customerType: number): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.http
        .get<ApiResponse>(GET_CUSTOMER(customerType))
        .pipe(map((response: ApiResponse) => response.data as Customer[]))
        .subscribe({
          next: (customer: Customer[]) => {
            this.customerSubject.next(customer);
            resolve();
          },
          error: (error) => {
            this.customerSubject.next([]);
            reject(error);
          },
        });
    });
  }

  async fetchTransactions(
    pageSize: number,
    pageNumber: number
  ): Promise<FetchApiResponse> {
    const formValue = this.transactionFilterForm.value;

    return new Promise((resolve, reject) => {
      return this.http
        .post<FetchApiResponse>(
          FETCH_TRANSACTIONS(pageSize, pageNumber),
          formValue
        )
        .subscribe({
          next: (response: FetchApiResponse) => {
            this.transactionSubject.next(
              response.data.data.transaction as FetchTransaction[]
            );
            this.statementId = response.data.data.statementId;
            this.addTransactionForm
              .get('statementId')
              ?.setValue(response.data.data.statementId);
            this.editTransactionForm
              .get('statementId')
              ?.setValue(response.data.data.statementId);
            resolve(response);
          },
          error: (error) => {
            this.transactionSubject.next([]);
            reject(error);
          },
        });
    });
  }

  async addTransaction(): Promise<void> {
    const formValue = this.addTransactionForm.value;

    try {
      await this.http.post<ApiResponse>(ADD_TRANSCTIONS, formValue).toPromise();
    } catch (error) {
      // Handle error if needed
      console.error('Error adding transaction:', error);
    }
  }

  async deleteTransaction(transactionId: number): Promise<void> {
    try {
      const statementId = this.addTransactionForm.get('statementId')?.value;

      if (statementId !== undefined) {
        await this.http
          .delete<void>(DELETE_TRANSACTIONS(statementId, transactionId))
          .toPromise();
      } else {
        console.warn('Statement ID is undefined.');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  async editTransaction(): Promise<void> {
    try {
      const formValue = this.editTransactionForm.value;
      await this.http
        .put<ApiResponse>(EDIT_TRANSACTIONS, formValue)
        .toPromise();
    } catch (error) {
      console.log(error);
    }
  }

  clearBanks(): void {
    this.bankSubject.next([]);
  }

  clearAccounts(): void {
    this.accountNumberSubject.next([]);
  }

  getStatementId() {
    return this.statementId;
  }
}

// export function onlyNumbersValidator(): ValidatorFn {
//   return (control: AbstractControl): { [key: string]: any } | null => {
//     const value = control.value;

//     if (value === null || value === undefined || value === '') {
//       // Allow empty values
//       return null;
//     }

//     const isNumber = /^[0-9]*$/.test(value);

//     return isNumber ? null : { onlyNumbers: { value: control.value } };
//   };
// }

export function chequeNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const chequeNumber = control.value;

    // Check if the value is numeric
    if (isNaN(chequeNumber)) {
      return {
        numeric: true,
        message: 'Cheque Number should only contain numeric values.',
      };
    }

    // Check if the length is not exceeding 15 digits
    if (chequeNumber.toString().length > 15) {
      return {
        maxLength: true,
        message: 'Cheque Number should not exceed 15 digits.',
      };
    }

    // Check if there are no alphabets
    if (/[a-zA-Z]/.test(chequeNumber)) {
      return {
        noAlphabets: true,
        message: 'Cheque Number should not have any alphabets.',
      };
    }

    // If all checks pass, return null (no errors)
    return null;
  };
}
