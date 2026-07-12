import request from '../request';

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
}): Promise<ListResponse> {
  return Promise.resolve({} as any);
}