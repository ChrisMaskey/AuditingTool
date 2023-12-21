export interface Transaction {
  clientId: string;
  bankName: string;
  accountNumber: string;
  date: Date;
  filterParams: {
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
  };
}
