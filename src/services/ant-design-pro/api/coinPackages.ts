// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API_ENDPOINTS } from '@/config/apiConfig';

/** 金币套餐数据类型 */
export interface CoinPackage {
  id: number;
  name: string;
  description: string;
  coin_amount: number;
  price: number; // 单位：分
  currency: string;
}

/** 金币套餐列表响应类型 */
export interface CoinPackageListResponse {
  success: boolean;
  data: CoinPackage[];
  total: number;
  message?: string;
}

/** 获取金币套餐列表
 * GET /api/order/coin/packages
 */
export async function getCoinPackages(
  options?: { [key: string]: any },
) {
  return request<CoinPackageListResponse>(API_ENDPOINTS.COIN_PACKAGES, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}