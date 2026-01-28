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
  pay_channel?: 'alipay' | 'mock';  // 支付渠道：支付宝或模拟支付
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

/** 模拟支付请求参数 */
export interface MockPayRequest {
  order_no: string;
}

/** 模拟支付响应类型 */
export interface MockPayResponse {
  success: boolean;
  message: string;
  data: {
    order_no: string;
    status: string;
    paid_at: string;
  };
}

/** 查询订单响应类型 */
export interface QueryOrderResponse {
  success: boolean;
  message: string;
  data: OrderData;
}

/** 支付宝支付请求参数 */
export interface AlipayPayRequest {
  order_no: string;
}

/** 支付宝支付响应类型 */
export interface AlipayPayResponse {
  success: boolean;
  message: string;
  pay_url: string;  // 支付宝支付链接
  order_no: string;
}

/** 查询订单状态响应类型 */
export interface OrderStatusResponse {
  success: boolean;
  message: string;
  order_no: string;
  status: string;  // CREATED | PAID | COMPLETED | CANCELLED
  is_paid: boolean;
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

/** 模拟支付
 * POST /api/order/coin/mock_pay
 */
export async function mockPayOrder(
  params: MockPayRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<MockPayResponse>(API_ENDPOINTS.MOCK_PAY_ORDER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    data: params,
    ...(options || {}),
  });
}

/** 查询订单详情
 * GET /api/order/{order_no}
 */
export async function getOrderDetail(
  orderNo: string,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<QueryOrderResponse>(`${API_ENDPOINTS.ORDER_DETAIL}/${orderNo}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    ...(options || {}),
  });
}

/** 获取支付宝支付链接
 * POST /api/order/alipay/pay
 */
export async function getAlipayPayUrl(
  params: AlipayPayRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AlipayPayResponse>(API_ENDPOINTS.ALIPAY_PAY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    data: params,
    ...(options || {}),
  });
}

/** 查询订单状态（用于轮询）
 * GET /api/order/status/{order_no}
 */
export async function getOrderStatus(
  orderNo: string,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<OrderStatusResponse>(`${API_ENDPOINTS.ORDER_STATUS}/${orderNo}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    ...(options || {}),
  });
}
