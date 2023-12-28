import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Client } from '../entity/client.model';
import { Bank } from '../entity/bank.model';
import { AccountNumber } from '../entity/account-number.model';
import { FetchTransaction } from '../entity/fetch-transaction.model';
import { FetchApiResponse } from '../../../../interfaces/fetch-api-response.interface';
import { Coa } from '../entity/coa.model';
import { Customer } from '../entity/customer.model';

export abstract class AuditTransactionFacade {
  abstract transactionFilterForm: FormGroup;
  abstract addTransactionForm: FormGroup;

  /**
   * Resets the Transaction Filter Form
   */
  abstract resetForm(): Promise<void>;

  abstract resetAddForm(): Promise<void>;

  /**
   * Observers and Observables
   */

  abstract clients$: Observable<Client[]>;
  abstract banks$: Observable<Bank[]>;
  abstract accounts$: Observable<AccountNumber[]>;
  abstract transactions$: Observable<FetchTransaction[]>;
  abstract coa$: Observable<Coa[]>;
  abstract customers$: Observable<Customer[]>;

  /**
   * Retrives all the clients
   */
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
  /**
   *Get Coa
   */
  abstract getCoa(): Promise<void>;
  /**
   *
   * @param customerType is the type of the customer
   */
  abstract getCustomers(customerType: number): Promise<void>;

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

  /**
   * Adds New Transaction
   */
  abstract addTransaction(): Promise<void>;
}
