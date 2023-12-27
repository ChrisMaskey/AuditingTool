export interface AddTransaction {
  statementId: number;
  date: string;
  transactionType: number;
  tradeType: number;
  customerId: number;
  employeeId: number;
  isEmployee: boolean;
  employeeName: string;
  coa: number;
  isCheque: boolean;
  chequeNumber: string;
  postedDate: string;
  amount: string;
}
