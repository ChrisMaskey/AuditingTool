import { Injectable, inject } from '@angular/core';
import { UploadJsonFacade } from './upload-json.facade';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Client } from '../../../feature-audit-transaction/application/entity/client.model';
import { Bank } from '../../../feature-audit-transaction/application/entity/bank.model';
import { HttpClient } from '@angular/common/http';
import { AccountNumber } from '../../../feature-audit-transaction/application/entity/account-number.model';
import { ApiResponse } from '../../../../interfaces/api-response-interface';
import {
  GET_ACCOUNT_NUMBERS,
  GET_BANKS,
  GET_CLIENTS,
} from '../../../../interfaces/Urls';
import { map } from 'rxjs/operators';

@Injectable()
export class UploadJsonService implements UploadJsonFacade {
  private http = inject(HttpClient);

  private clientSubject = new BehaviorSubject<Client[]>([]);
  clients$ = this.clientSubject.asObservable();

  private bankSubject = new BehaviorSubject<Bank[]>([]);
  banks$ = this.bankSubject.asObservable();

  private accountSubject = new BehaviorSubject<AccountNumber[]>([]);
  accounts$ = this.accountSubject.asObservable();

  private formBuilder = inject(FormBuilder);
  private requiredValidator = Validators.required;

  public uploadJsonForm!: FormGroup;
  constructor() {
    this.initUploadJsonForm();
  }

  private initUploadJsonForm(): void {
    this.uploadJsonForm = this.formBuilder.group({
      client: ['', this.requiredValidator],
      bank: ['', this.requiredValidator],
      accountNumber: ['', this.requiredValidator],
    });
  }

  public resetForm(): void {
    this.uploadJsonForm.reset();
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
          error: (error) => {
            this.clientSubject.next([]);
            reject(error);
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
          next: (bank: Bank[]) => {
            this.bankSubject.next(bank);
            resolve();
          },
          error: (error) => {
            this.bankSubject.next([]);
            reject(error);
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
          next: (account: AccountNumber[]) => {
            this.accountSubject.next(account);
            resolve();
          },
          error: (error) => {
            this.accountSubject.next([]);
            reject(error);
          },
        });
    });
  }

  clearBanks(): void {
    this.bankSubject.next([]);
  }

  clearAccounts(): void {
    this.accountSubject.next([]);
  }
}
