// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
// import { API_ENDPOINTS } from '@/config/apiConfig';
import { API_ENDPOINTS, TOKEN_KEY } from '@/config/apiConfig';

/** 金币套餐数据类型 */
export interface CoinPackage {
  id: number;
  name: string;
  description: string;
  coin_amount: number;
  price: number; // 单位：分
}

/** 金币套餐列表响应类型 */
export interface CoinPackageListResponse {
  success: boolean;
  data: CoinPackage[];
  total: number;
  message?: string;
}

/** 创建订单请求参数 */
export interface CreateOrderRequest {
  item_id: number;
}

/** 订单数据类型 */
export interface OrderData {
  order_no: string;
  item_id: number;
  item_name: string;
  coin_amount: number;
  total_amount: number;
  status: string;
  pay_channel: string;
  created_at: string;
}

/** 创建订单响应类型 */
export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: OrderData;
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

/** 创建金币订单
 * POST /api/order/coin/create
 */
export async function createCoinOrder(
  params: CreateOrderRequest,
  options?: { [key: string]: any },
) {
     const token = localStorage.getItem(TOKEN_KEY);
  return request<CreateOrderResponse>(API_ENDPOINTS.CREATE_COIN_ORDER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
    },
    data: params,
    ...(options || {}),
  });
}