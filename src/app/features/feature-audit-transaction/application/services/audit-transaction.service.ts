import { Injectable, inject } from '@angular/core';
import { AuditTransactionFacade } from './audit-transaction.facade';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  FETCH_TRANSACTIONS,
  GET_ACCOUNT_NUMBERS,
  GET_BANKS,
  GET_CLIENTS,
} from '../../../../interfaces/Urls';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  tap,
  throwError,
} from 'rxjs';
import { Client } from '../entity/client.model';
import { ApiResponse } from '../../../../interfaces/api-response-interface';
import { HttpClient } from '@angular/common/http';
import { Bank } from '../entity/bank.model';
import { AccountNumber } from '../entity/account-number.model';
import { Transaction } from '../entity/transaction.model';
import { DatePipe } from '@angular/common';
import { FetchApiResponse } from '../../../../interfaces/fetch-api-response.interface';
import { FetchTransaction } from '../entity/fetch-transaction.model';

@Injectable()
export class AuditTransactionService implements AuditTransactionFacade {
  private http = inject(HttpClient);

  private clientSubject = new BehaviorSubject<Client[]>([]);
  clients$ = this.clientSubject.asObservable();

  private bankSubject = new BehaviorSubject<Bank[]>([]);
  banks$ = this.bankSubject.asObservable();

  private accountNumberSubject = new BehaviorSubject<AccountNumber[]>([]);
  accounts$ = this.accountNumberSubject.asObservable();

  private transactionSubject = new BehaviorSubject<FetchTransaction[]>([]);
  transactions$ = this.transactionSubject.asObservable();

  private formBuilder = inject(FormBuilder);
  private requiredValidator = Validators.required;
  public transactionFilterForm!: FormGroup;

  constructor() {
    this.initTransactionFilterForm();
  }

  private initTransactionFilterForm(): void {
    this.transactionFilterForm = this.formBuilder.group({
      clientId: ['', this.requiredValidator],
      bankName: ['', this.requiredValidator],
      accountNumber: ['', this.requiredValidator],
      date: ['', this.requiredValidator],
      filterParams: this.formBuilder.group({
        date: [''],
        transactionMode: [''],
        name: [''],
        coa: [''],
        chequeNumber: [''],
        transactionType: [''],
        isEmployee: [true],
        postedDate: [''],
        amount: [0],
        tradeType: [''],
      }),
    });
  }

  public resetForm(): Promise<void> {
    return new Promise((resolve) => {
      this.transactionFilterForm.reset();
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

  fetchTransactions(
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
              response.data.data as FetchTransaction[]
            );
            resolve(response);
          },
          error: (error) => {
            this.transactionSubject.next([]);
            reject(error);
          },
        });
    });
  }

  clearBanks(): void {
    this.bankSubject.next([]);
  }

  clearAccounts(): void {
    this.accountNumberSubject.next([]);
  }
}
