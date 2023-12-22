import { FetchTransaction } from '../features/feature-audit-transaction/application/entity/fetch-transaction.model';

export interface FetchApiResponse {
  statusCode: number;
  data: {
    totalCount: number;
    pageSize: number;
    pageNumber: number;
    data: FetchTransaction[];
  };
  errors: string[];
}
