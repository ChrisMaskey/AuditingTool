export interface EditTransaction {
  tranasactionId: number;
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
