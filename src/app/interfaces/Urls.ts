import { environment } from '../environments/environment';
const BASE_URL = environment.vaccxUrl;

export const GET_CLIENTS = BASE_URL + 'dropdown/client';
export const GET_BANKS = (clientId: number) =>
  `${BASE_URL}dropdown/bank?clientId=${clientId}`;
export const GET_ACCOUNT_NUMBERS = (clientId: number, bankName: string) =>
  `${BASE_URL}dropdown/account-number?clientId=${clientId}&bankName=${bankName}`;
