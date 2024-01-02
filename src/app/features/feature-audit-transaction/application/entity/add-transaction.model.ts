export interface AddTransaction {
  statementId: number;
  date: string;
  transactionType: number;
  customerId: number;
  isEmployee: boolean;
  coa: number;
  isCheque: boolean;
  chequeNumber: string;
  postedDate: string;
  amount: number;
}
