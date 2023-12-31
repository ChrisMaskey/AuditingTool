import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Client } from '../entity/client.model';
import { Bank } from '../entity/bank.model';
import { AccountNumber } from '../entity/account-number.model';
import { Transaction } from '../entity/transaction.model';
import { FetchTransaction } from '../entity/fetch-transaction.model';
import { FetchApiResponse } from '../../../../interfaces/fetch-api-response.interface';

export abstract class AuditTransactionFacade {
  abstract transactionFilterForm: FormGroup;

  /**
   * Resets the Transaction Filter Form
   */
  abstract resetForm(): Promise<void>;

  /**
   * Observers and Observables
   */

  abstract clients$: Observable<Client[]>;
  abstract banks$: Observable<Bank[]>;
  abstract accounts$: Observable<AccountNumber[]>;
  abstract transactions$: Observable<FetchTransaction[]>;
  abstract getClients(): Promise<void>;

  /**
   *Get Bank by Client Id
   * @param clientId is a client's id which is used to get the banks
   */
  abstract getBanks(clientId: number): Promise<void>;
  /**
   *Get Bank Account by Client and Bank Name
   * @param clientId is a client's id which is used to get the bank account
   * @param bankName is a bank's name which is used to get the bank account
   */
  abstract getAccounts(clientId: number, bankName: String): Promise<void>;

  abstract clearBanks(): void;
  abstract clearAccounts(): void;

  /**
   *@param pageSize is the number of items to be displayed on a page
   *@param pageNumber is the current page number
   */
  abstract fetchTransactions(
    pageSize: number,
    pageNumber: number
  ): Promise<FetchApiResponse>;
}
