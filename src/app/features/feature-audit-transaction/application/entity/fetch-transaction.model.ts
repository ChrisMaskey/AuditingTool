export interface FetchTransaction {
  id: number;
  date: string;
  transactionMode: string;
  name: string;
  coa: string;
  chequeNumber: string;
  transactionType: string;
  isEmployee: boolean;
  postedDate: string;
  amount: number;
  tradeType: string;
}
