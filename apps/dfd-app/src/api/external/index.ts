import axios from 'axios';
import type { AxiosPromise } from 'axios';

export interface InterfaceItem {
  interfaceId: string;
  interfaceName: string;
  dataType: string;
  supplier: string;
  price: number;
  dataName: string;
}

interface ListResponse {
  list: InterfaceItem[];
  total: number;
}

export function getExternalInterfaces(params: {
  dataType?: string;
  dataCategory?: string;
  supplier?: string;
  productId?: string;
  keyword?: string;
  page: number;
  size: number;
}): AxiosPromise<ListResponse> {
  return Promise.resolve({} as any);
}