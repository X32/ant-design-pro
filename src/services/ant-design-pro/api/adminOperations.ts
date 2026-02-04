// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API_BASE_URL, TOKEN_KEY } from '@/config/apiConfig';

/** ==================== 类型定义 ==================== */

/** 操作类型 */
export type OperationType = 'grant_vip' | 'adjust_balance' | 'all';

/** 操作日志记录 */
export interface OperationLog {
  id: string; // vip_{订阅ID} 或 coin_{流水ID}
  operation_type: OperationType;
  operator_id: number;
  operator_email: string | null;
  user_id: number;
  user_email: string;
  description: string;
  amount: number; // 金币操作为金币数量，VIP操作为天数
  remark: string;
  created_at: string;
}

/** 钱包信息 */
export interface WalletInfo {
  id: number;
  user_id: number;
  email: string;
  balance: number;
  frozen_balance: number;
  created_at: string;
  updated_at: string;
}

/** 钱包详情 */
export interface WalletDetail {
  wallet: {
    id: number;
    user_id: number;
    balance: number;
    frozen_balance: number;
    created_at: string;
    updated_at: string;
  };
  user: {
    user_id: number;
    email: string;
    is_active: boolean;
    created_at: string;
  };
  statistics: {
    total_recharge: number;
    total_consume: number;
    transaction_count: number;
    last_transaction_time: string;
  };
}

/** VIP套餐（复用 vipSubscription.ts 的类型） */
export interface AdminVipPlan {
  id: number;
  exam_category_id: number;
  exam_level: string;
  plan_type: string;
  duration_days: number;
  original_price: number;
  sale_price: number;
  first_buy_discount: number;
  first_buy_price: number;
  plan_name: string;
  description: string;
  features: string;
  status: string;
  created_at: string;
}

/** 开通VIP请求参数 */
export interface GrantVipRequest {
  user_id: number;
  plan_id: number;
  remark: string;
  duration_days?: number; // 自定义天数
}

/** 调整余额请求参数 */
export interface AdjustBalanceRequest {
  change_amount: number; // 正数=增加，负数=减少
  remark: string;
}

/** ==================== API 方法 ==================== */

/**
 * 查询管理员操作日志
 * GET /api/admin/operations/logs
 */
export async function getOperationLogs(params: {
  operation_type?: OperationType;
  operator_id?: number;
  user_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<{
    success: boolean;
    data: OperationLog[];
    total: number;
    page: number;
    page_size: number;
    message: string;
  }>(`${API_BASE_URL}/api/admin/operations/logs`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

/**
 * 获取VIP套餐列表
 * GET /api/admin/vip-plans
 */
export async function getAdminVipPlans(params?: {
  page?: number;
  page_size?: number;
  exam_level?: string;
  status?: string;
}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<{
    success: boolean;
    data: AdminVipPlan[];
    total: number;
    page: number;
    page_size: number;
    message: string;
  }>(`${API_BASE_URL}/api/admin/vip-plans/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

/**
 * 通过邮箱查询用户钱包
 * GET /api/admin/wallets
 */
export async function getWalletByEmail(email: string) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<{
    success: boolean;
    data: WalletInfo[];
    total: number;
    message: string;
  }>(`${API_BASE_URL}/api/admin/wallets`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { user_email: email },
  });
}

/**
 * 获取用户钱包详情
 * GET /api/admin/wallets/{user_id}
 */
export async function getWalletDetail(userId: number) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<{
    success: boolean;
    data: WalletDetail;
    message: string;
  }>(`${API_BASE_URL}/api/admin/wallets/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 管理员开通VIP
 * POST /api/admin/vip-subscriptions/grant
 */
export async function grantVip(data: GrantVipRequest) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<{
    success: boolean;
    message: string;
    data: {
      subscription_id: number;
      user_id: number;
      plan_name: string;
      exam_level: string;
      start_time: string;
      end_time: string;
      duration_days: number;
      order_no: string;
      operator_id: number;
      operator_email: string;
    };
  }>(`${API_BASE_URL}/api/admin/vip-subscriptions/grant`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
}

/**
 * 调整用户余额
 * POST /api/admin/wallets/{user_id}/adjust
 */
export async function adjustBalance(userId: number, data: AdjustBalanceRequest) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<{
    success: boolean;
    message: string;
  }>(`${API_BASE_URL}/api/admin/wallets/${userId}/adjust`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
}

/**
 * 获取操作统计数据
 * GET /api/admin/operations/statistics
 */
export async function getOperationStatistics(params?: {
  start_date?: string;
  end_date?: string;
}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<{
    success: boolean;
    data: {
      total_operations: number;
      grant_vip_count: number;
      adjust_balance_count: number;
      total_coins_granted: number;
      total_coins_deducted: number;
      unique_operators: number;
      unique_users: number;
    };
    message: string;
  }>(`${API_BASE_URL}/api/admin/operations/statistics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}
