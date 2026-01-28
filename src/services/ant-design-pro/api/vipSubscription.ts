// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API_ENDPOINTS, TOKEN_KEY } from '@/config/apiConfig';

/** ==================== 类型定义 ==================== */

/** VIP套餐类型 */
export type PlanType = 'monthly' | 'quarterly' | 'yearly';

/** 考试级别 */
export type ExamLevel = 'KET' | 'PET' | 'FCE' | 'ALL';

/** 订阅状态 */
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED';

/** VIP订阅套餐 */
export interface VipSubscriptionPlan {
  id: number;
  exam_category_id: number; // 考试分类ID
  exam_level: ExamLevel;
  plan_type: PlanType;
  plan_name: string;
  duration_days: number;
  original_price: number; // 单位：分
  sale_price: number; // 单位：分
  first_buy_discount: number; // 首购折扣金额，单位：分
  first_buy_price: number; // 首购价格，单位：分
  description: string;
  features?: string; // JSON字符串
  status: number; // 0=下架，1=上架
  sort: number; // 排序值，越小越靠前
  is_recommended: number; // 0 或 1
  created_at: string;
  updated_at: string;
}

/** 用户订阅信息 */
export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  exam_category_id: number;
  exam_level: ExamLevel;
  plan_type: PlanType;
  start_time: string;
  end_time: string;
  duration_days: number;
  paid_amount: number; // 单位：分
  original_price: number; // 单位：分
  is_first_buy: number; // 0 或 1
  status: SubscriptionStatus;
  auto_renew: number; // 0 或 1
  order_id: number;
  order_no: string;
  remaining_days: number;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
  renewal_options?: RenewalOption[]; // 续费选项
}

/** 订阅订单信息 */
export interface SubscriptionOrder {
  order_id: number;
  order_no: string;
  plan_name: string;
  exam_level: ExamLevel;
  plan_type: PlanType;
  duration_days: number;
  amount: number; // 单位：分
  is_first_buy: boolean;
  pay_channel: string;
  pay_url?: string;
  expired_at: string;
}

/** 订阅历史记录 */
export interface SubscriptionHistory {
  id: number;
  exam_level: ExamLevel;
  plan_type: PlanType;
  order_no: string;
  status: SubscriptionStatus;
  start_time: string;
  end_time: string;
  paid_amount: number; // 单位：分
  is_first_buy: number;
}

/** 续费选项 */
export interface RenewalOption {
  plan_id: number;
  plan_name: string;
  plan_type: PlanType;
  duration_days: number;
  price: number; // 单位：分
  expected_end_time: string;
  is_recommended: number; // 0 或 1
}

/** ==================== 请求/响应类型 ==================== */

/** 获取VIP套餐列表 - 请求参数 */
export interface GetVipPlansRequest {
  exam_level?: ExamLevel;
}

/** 获取VIP套餐列表 - 响应 */
export interface GetVipPlansResponse {
  success: boolean;
  data: {
    plans: VipSubscriptionPlan[]; // 改为扁平数组
    total: number; // 套餐总数
    message?: string; // 提示信息
  };
  message?: string;
}

/** 查询我的订阅状态 - 响应 */
export interface GetMySubscriptionResponse {
  success: boolean;
  data: {
    has_subscription: boolean;
    subscriptions: UserSubscription[]; // 改为数组
    total: number; // 订阅总数
  };
  message?: string;
}

/** 创建VIP订阅订单 - 请求参数 */
export interface CreateSubscriptionOrderRequest {
  plan_id: number;
  pay_channel: 'alipay' | 'wechat';
}

/** 创建VIP订阅订单 - 响应 */
export interface CreateSubscriptionOrderResponse {
  success: boolean;
  message: string;
  data: SubscriptionOrder;
}

/** 检查访问权限 - 请求参数 */
export interface CheckAccessRequest {
  exam_level: ExamLevel;
}

/** 检查访问权限 - 响应（有权限） */
export interface CheckAccessResponse {
  success: boolean;
  data: {
    has_access: boolean;
    subscription?: {
      exam_level: ExamLevel;
      end_time: string;
      remaining_days: number;
    };
    message?: string;
    recommend_plans?: Array<{
      id: number;
      plan_name: string;
      price: number;
    }>;
  };
}

/** 查询订阅历史 - 请求参数 */
export interface GetSubscriptionHistoryRequest {
  page?: number;
  page_size?: number;
}

/** 查询订阅历史 - 响应 */
export interface GetSubscriptionHistoryResponse {
  success: boolean;
  data: {
    subscriptions: SubscriptionHistory[];
    total: number;
    page: number;
    page_size: number;
  };
  message?: string;
}

/** ==================== API 接口 ==================== */

/**
 * 1. 获取VIP套餐列表
 * GET /api/order/vip/plans
 */
export async function getVipPlans(
  params?: GetVipPlansRequest,
  options?: { [key: string]: any },
) {
  return request<GetVipPlansResponse>(API_ENDPOINTS.VIP_PLANS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params,
    ...(options || {}),
  });
}

/**
 * 2. 查询我的订阅状态
 * GET /api/order/vip/my-subscription
 * 需要认证
 */
export async function getMySubscription(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<GetMySubscriptionResponse>(API_ENDPOINTS.VIP_MY_SUBSCRIPTION, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/**
 * 3. 创建VIP订阅订单
 * POST /api/order/vip/subscribe
 * 需要认证
 */
export async function createSubscriptionOrder(
  params: CreateSubscriptionOrderRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<CreateSubscriptionOrderResponse>(API_ENDPOINTS.VIP_SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 4. 检查访问权限
 * POST /api/order/vip/check-access
 * 需要认证
 */
export async function checkVipAccess(
  params: CheckAccessRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<CheckAccessResponse>(API_ENDPOINTS.VIP_CHECK_ACCESS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 5. 查询订阅历史
 * GET /api/order/vip/history
 * 需要认证
 */
export async function getSubscriptionHistory(
  params?: GetSubscriptionHistoryRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<GetSubscriptionHistoryResponse>(API_ENDPOINTS.VIP_HISTORY, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    params: {
      page: params?.page || 1,
      page_size: params?.page_size || 20,
    },
    ...(options || {}),
  });
}

/** ==================== 管理员接口类型定义 ==================== */

/** 管理员套餐详情（包含更多字段） */
export interface AdminVipPlan {
  id: number;
  exam_category_id: number;
  exam_level: ExamLevel;
  plan_type: string;
  plan_name: string;
  duration_days: number;
  original_price: number; // 单位：分
  sale_price: number; // 单位：分
  first_buy_discount: number; // 单位：分
  first_buy_price: number; // 单位：分
  description: string;
  features?: string; // JSON字符串
  status: number; // 1=上架，0=下架
  status_label: string; // "上架" 或 "下架"
  sort: number;
  is_recommended: number; // 0 或 1
  created_at: string;
  updated_at: string;
}

/** 管理员查询套餐列表 - 请求参数 */
export interface AdminGetVipPlansRequest {
  exam_level?: ExamLevel;
  status?: number; // 1=上架，0=下架
}

/** 管理员查询套餐列表 - 响应 */
export interface AdminGetVipPlansResponse {
  success: boolean;
  data: AdminVipPlan[];
  total: number;
  message?: string;
}

/** 管理员查询套餐详情 - 响应 */
export interface AdminGetVipPlanDetailResponse {
  success: boolean;
  data: AdminVipPlan;
  message?: string;
}

/** 管理员创建套餐 - 请求参数 */
export interface AdminCreateVipPlanRequest {
  exam_category_id: number;
  exam_level: ExamLevel;
  plan_type: string;
  duration_days: number;
  original_price: number;
  sale_price: number;
  first_buy_discount: number;
  first_buy_price: number;
  plan_name: string;
  description: string;
  features?: string;
  status: number;
  sort: number;
  is_recommended: number;
}

/** 管理员创建套餐 - 响应 */
export interface AdminCreateVipPlanResponse {
  success: boolean;
  data: AdminVipPlan;
  message?: string;
}

/** 管理员更新套餐 - 请求参数（所有字段可选） */
export interface AdminUpdateVipPlanRequest {
  exam_category_id?: number;
  exam_level?: ExamLevel;
  plan_type?: string;
  duration_days?: number;
  original_price?: number;
  sale_price?: number;
  first_buy_discount?: number;
  first_buy_price?: number;
  plan_name?: string;
  description?: string;
  features?: string;
  status?: number;
  sort?: number;
  is_recommended?: number;
}

/** 管理员更新套餐 - 响应 */
export interface AdminUpdateVipPlanResponse {
  success: boolean;
  data: AdminVipPlan;
  message?: string;
}

/** 管理员更新套餐状态 - 请求参数 */
export interface AdminUpdateVipPlanStatusRequest {
  status: number; // 1=上架，0=下架
}

/** 管理员更新套餐状态 - 响应 */
export interface AdminUpdateVipPlanStatusResponse {
  success: boolean;
  message?: string;
}

/** 管理员删除套餐 - 响应 */
export interface AdminDeleteVipPlanResponse {
  success: boolean;
  message?: string;
}

/** ==================== 管理员API接口 ==================== */

/**
 * 管理员1. 查询套餐列表
 * GET /api/admin/vip-plans/
 * 需要认证（超级用户）
 */
export async function adminGetVipPlans(
  params?: AdminGetVipPlansRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminGetVipPlansResponse>(`${API_ENDPOINTS.ADMIN_VIP_PLANS}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    params,
    ...(options || {}),
  });
}

/**
 * 管理员2. 查询套餐详情
 * GET /api/admin/vip-plans/{plan_id}
 * 需要认证（超级用户）
 */
export async function adminGetVipPlanDetail(
  planId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminGetVipPlanDetailResponse>(`${API_ENDPOINTS.ADMIN_VIP_PLANS}/${planId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/**
 * 管理员3. 创建套餐
 * POST /api/admin/vip-plans/
 * 需要认证（超级用户）
 */
export async function adminCreateVipPlan(
  data: AdminCreateVipPlanRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminCreateVipPlanResponse>(`${API_ENDPOINTS.ADMIN_VIP_PLANS}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    data,
    ...(options || {}),
  });
}

/**
 * 管理员4. 更新套餐
 * PUT /api/admin/vip-plans/{plan_id}
 * 需要认证（超级用户）
 */
export async function adminUpdateVipPlan(
  planId: number,
  data: AdminUpdateVipPlanRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminUpdateVipPlanResponse>(`${API_ENDPOINTS.ADMIN_VIP_PLANS}/${planId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    data,
    ...(options || {}),
  });
}

/**
 * 管理员5. 上架/下架套餐
 * PATCH /api/admin/vip-plans/{plan_id}/status
 * 需要认证（超级用户）
 */
export async function adminUpdateVipPlanStatus(
  planId: number,
  data: AdminUpdateVipPlanStatusRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminUpdateVipPlanStatusResponse>(`${API_ENDPOINTS.ADMIN_VIP_PLANS}/${planId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    data,
    ...(options || {}),
  });
}

/**
 * 管理员6. 删除套餐
 * DELETE /api/admin/vip-plans/{plan_id}
 * 需要认证（超级用户）
 */
export async function adminDeleteVipPlan(
  planId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminDeleteVipPlanResponse>(`${API_ENDPOINTS.ADMIN_VIP_PLANS}/${planId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** ==================== 管理员订阅记录接口类型定义 ==================== */

/** 管理员订阅记录详情 */
export interface AdminSubscriptionRecord {
  id: number;
  user_id: number;
  username: string;
  plan_id: number;
  plan_name: string;
  plan_description?: string;
  exam_level: ExamLevel;
  plan_type: PlanType;
  start_time: string;
  end_time: string;
  duration_days: number;
  paid_amount: number; // 单位：分
  original_price: number; // 单位：分
  is_first_buy: number; // 0 或 1
  status: SubscriptionStatus;
  order_id: number;
  order_no: string;
  created_at: string;
  updated_at: string;
}

/** 管理员查询订阅记录列表 - 请求参数 */
export interface AdminGetSubscriptionListRequest {
  user_id?: number; // 筛选特定用户
  status?: SubscriptionStatus; // 筛选订阅状态
  page?: number; // 页码，默认1
  page_size?: number; // 每页数量，默认20，范围1-100
}

/** 管理员查询订阅记录列表 - 响应 */
export interface AdminGetSubscriptionListResponse {
  success: boolean;
  data: {
    records: AdminSubscriptionRecord[];
    total: number;
    page: number;
    page_size: number;
  };
  message?: string;
}

/** 用户订阅摘要 */
export interface UserSubscriptionSummary {
  user_id: number;
  username: string;
  total_subscriptions: number; // 历史总订阅次数
  active_subscriptions: number; // 当前有效订阅数
  last_subscription_end_time: string; // 最后一次订阅的到期时间（关键字段）
  total_paid_amount: number; // 累计支付金额（分）
  first_subscription_time: string; // 首次订阅时间
  last_subscription_time: string; // 最近一次订阅时间
}

/** 管理员查询用户订阅摘要 - 响应 */
export interface AdminGetUserSubscriptionSummaryResponse {
  success: boolean;
  data: UserSubscriptionSummary;
  message?: string;
}

/** 管理员查询用户订阅历史 - 请求参数 */
export interface AdminGetUserSubscriptionHistoryRequest {
  page?: number; // 页码，默认1
  page_size?: number; // 每页数量，默认20，范围1-100
}

/** 管理员查询用户订阅历史 - 响应 */
export interface AdminGetUserSubscriptionHistoryResponse {
  success: boolean;
  data: {
    records: AdminSubscriptionRecord[];
    total: number;
    page: number;
    page_size: number;
    summary: {
      total_subscriptions: number;
      active_subscriptions: number;
      last_subscription_end_time: string;
      total_paid_amount: number;
    };
  };
  message?: string;
}

/** 订阅统计 - 总体数据 */
export interface SubscriptionOverallStatistics {
  total_subscriptions: number; // 总订阅数
  active_subscriptions: number; // 当前有效订阅数
  expired_subscriptions: number; // 已过期订阅数
  total_revenue: number; // 总收入（分）
}

/** 订阅统计 - 按套餐类型 */
export interface SubscriptionByPlanType {
  plan_type: PlanType;
  count: number; // 订阅数
  revenue: number; // 收入（分）
}

/** 订阅统计 - 按状态 */
export interface SubscriptionByStatus {
  status: SubscriptionStatus;
  count: number; // 订阅数
}

/** 管理员查询订阅统计 - 响应 */
export interface AdminGetSubscriptionStatisticsResponse {
  success: boolean;
  data: {
    overall: SubscriptionOverallStatistics;
    by_plan_type: SubscriptionByPlanType[];
    by_status: SubscriptionByStatus[];
  };
  message?: string;
}

/** ==================== 管理员订阅记录API接口 ==================== */

/**
 * 管理员订阅1. 查询订阅记录列表
 * GET /api/admin/vip-subscriptions/list
 * 需要认证（管理员）
 */
export async function adminGetSubscriptionList(
  params?: AdminGetSubscriptionListRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminGetSubscriptionListResponse>(`${API_ENDPOINTS.ADMIN_VIP_SUBSCRIPTIONS}/list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    params: {
      user_id: params?.user_id,
      status: params?.status,
      page: params?.page || 1,
      page_size: params?.page_size || 20,
    },
    ...(options || {}),
  });
}

/**
 * 管理员订阅2. 查询用户订阅摘要
 * GET /api/admin/vip-subscriptions/user/{user_id}/summary
 * 需要认证（管理员）
 */
export async function adminGetUserSubscriptionSummary(
  userId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminGetUserSubscriptionSummaryResponse>(
    `${API_ENDPOINTS.ADMIN_VIP_SUBSCRIPTIONS}/user/${userId}/summary`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      ...(options || {}),
    },
  );
}

/**
 * 管理员订阅3. 查询用户订阅历史
 * GET /api/admin/vip-subscriptions/user/{user_id}/history
 * 需要认证（管理员）
 */
export async function adminGetUserSubscriptionHistory(
  userId: number,
  params?: AdminGetUserSubscriptionHistoryRequest,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminGetUserSubscriptionHistoryResponse>(
    `${API_ENDPOINTS.ADMIN_VIP_SUBSCRIPTIONS}/user/${userId}/history`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      params: {
        page: params?.page || 1,
        page_size: params?.page_size || 20,
      },
      ...(options || {}),
    },
  );
}

/**
 * 管理员订阅4. 查询订阅统计数据
 * GET /api/admin/vip-subscriptions/statistics
 * 需要认证（管理员）
 */
export async function adminGetSubscriptionStatistics(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  return request<AdminGetSubscriptionStatisticsResponse>(`${API_ENDPOINTS.ADMIN_VIP_SUBSCRIPTIONS}/statistics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}
