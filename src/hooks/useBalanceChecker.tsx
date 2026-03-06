/**
 * useBalanceChecker Hook
 * 管理用户余额检查、VIP 订阅状态、金币扣除等逻辑
 */

import { useState, useCallback, useRef } from 'react';
import { Modal } from 'antd';
import { history } from '@umijs/max';
import {
  getWalletBalance,
  consumeCoins,
  getWorkflowTypes,
} from '@/services/ant-design-pro/api';
import { getMySubscription } from '@/services/ant-design-pro/api/vipSubscription';
import type { UseBalanceCheckerReturn, WorkflowTypeOption } from '@/types/spoken';

interface UseBalanceCheckerOptions {
  /** 工作流类型（用于获取价格） */
  workflowType?: string;
  /** 余额不足时是否显示弹窗 */
  showModalOnInsufficient?: boolean;
}

/**
 * 余额检查 Hook
 * 
 * @example
 * ```tsx
 * const {
 *   hasVipSubscription,
 *   vipRemainingDays,
 *   balance,
 *   checkBalance,
 *   consumeCoins: handleConsumeCoins,
 *   refreshBalance,
 *   refreshVipStatus,
 * } = useBalanceChecker({
 *   workflowType: 'fce_part1',
 * });
 * ```
 */
export function useBalanceChecker({
  workflowType = 'fce_part1',
  showModalOnInsufficient = true,
}: UseBalanceCheckerOptions = {}): UseBalanceCheckerReturn {
  /** VIP 订阅状态 */
  const [hasVipSubscription, setHasVipSubscription] = useState(false);
  
  /** VIP 剩余天数 */
  const [vipRemainingDays, setVipRemainingDays] = useState(0);
  
  /** 钱包余额 */
  const [balance, setBalance] = useState(0);
  
  /** VIP 加载状态 */
  const [vipLoading, setVipLoading] = useState(false);
  
  /** 余额加载状态 */
  const [balanceLoading, setBalanceLoading] = useState(false);
  
  /** 工作流价格映射 */
  const [workflowPriceMap, setWorkflowPriceMap] = useState<Map<string, number>>(new Map());
  
  /** 余额检查标记（避免重复检查） */
  const balanceCheckedRef = useRef(false);

  /**
   * 加载工作流价格映射
   */
  const loadWorkflowPrices = useCallback(async () => {
    try {
      const response = await getWorkflowTypes({ only_active: true });
      
      if (response && response.success && Array.isArray(response.data)) {
        const priceMap = new Map<string, number>();
        response.data.forEach((item: WorkflowTypeOption) => {
          const price = typeof item.price === 'number' 
            ? item.price 
            : parseFloat(String(item.price));
          priceMap.set(item.value, price);
        });
        
        setWorkflowPriceMap(priceMap);
        console.log('✅ 工作流价格映射加载成功:', Object.fromEntries(priceMap));
        return priceMap;
      }
      return new Map();
    } catch (error) {
      console.error('❌ 加载工作流价格异常:', error);
      return new Map();
    }
  }, []);

  /**
   * 获取工作流价格
   */
  const getWorkflowPrice = useCallback((type: string): number => {
    const price = workflowPriceMap.get(type);
    return price !== undefined ? price : 0;
  }, [workflowPriceMap]);

  /**
   * 查询 VIP 订阅状态
   */
  const refreshVipStatus = useCallback(async (): Promise<void> => {
    try {
      setVipLoading(true);
      console.log('🔍 开始查询 VIP 订阅状态...');
      
      const response = await getMySubscription();
      
      if (response.success && response.data) {
        const { has_subscription, subscriptions } = response.data;
        
        let hasValidSubscription = false;
        let maxRemainingDays = 0;
        
        if (has_subscription && subscriptions && subscriptions.length > 0) {
          subscriptions.forEach((sub) => {
            if (sub.remaining_days > 0) {
              hasValidSubscription = true;
              maxRemainingDays = Math.max(maxRemainingDays, sub.remaining_days);
            }
          });
        }
        
        setHasVipSubscription(hasValidSubscription);
        setVipRemainingDays(maxRemainingDays);
        
        if (hasValidSubscription) {
          console.log(`✅ 用户拥有 VIP 订阅，剩余天数：${maxRemainingDays} 天`);
          console.log('💎 VIP 用户可以免费使用所有功能，无需金币支付');
        } else {
          console.log('❌ 用户没有有效的 VIP 订阅，需要金币支付');
        }
      } else {
        console.error('❌ 查询 VIP 订阅状态失败:', response.message);
        setHasVipSubscription(false);
        setVipRemainingDays(0);
      }
    } catch (error: any) {
      console.error('❌ 查询 VIP 订阅状态异常:', error);
      setHasVipSubscription(false);
      setVipRemainingDays(0);
    } finally {
      setVipLoading(false);
    }
  }, []);

  /**
   * 查询用户余额
   */
  const refreshBalance = useCallback(async (): Promise<number> => {
    try {
      setBalanceLoading(true);
      const response = await getWalletBalance();
      
      if (response.success && response.data) {
        const newBalance = response.data.balance;
        setBalance(newBalance);
        console.log(`💰 用户余额：${newBalance} 金币`);
        return newBalance;
      }
      return 0;
    } catch (error) {
      console.error('❌ 查询余额异常:', error);
      return 0;
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  /**
   * 检查余额是否充足
   */
  const checkBalance = useCallback(async (
    price?: number,
    show: boolean = showModalOnInsufficient
  ): Promise<{ sufficient: boolean; balance: number; price: number }> => {
    try {
      // 获取当前价格
      const currentPrice = price !== undefined ? price : getWorkflowPrice(workflowType);
      
      // ✅ VIP 用户特权：直接返回充足状态，无需金币
      if (hasVipSubscription && vipRemainingDays > 0) {
        console.log(`💎 VIP 用户特权：跳过金币检查（剩余${vipRemainingDays}天）`);
        return {
          sufficient: true,
          balance: 0,
          price: 0,
        };
      }
      
      // 如果价格为 0，直接返回充足
      if (currentPrice <= 0) {
        console.log('💰 练习价格为 0，跳过余额检查');
        return {
          sufficient: true,
          balance: 0,
          price: 0,
        };
      }
      
      // 查询用户余额
      const currentBalance = await refreshBalance();
      const sufficient = currentBalance >= currentPrice;
      console.log(`💰 用户余额：${currentBalance} 金币，需要：${currentPrice} 金币，充足：${sufficient}`);
      
      // 如果余额不足且需要显示弹框
      if (!sufficient && show) {
        Modal.confirm({
          title: '余额不足',
          content: (
            <div>
              <p>您的金币余额不足，无法开始练习。</p>
              <p style={{ marginTop: '12px' }}>
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  当前余额：{currentBalance} 金币
                </span>
              </p>
              <p>
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                  需要金币：{currentPrice} 金币
                </span>
              </p>
              <p style={{ marginTop: '12px', color: '#666' }}>是否前往充值页面？</p>
            </div>
          ),
          okText: '去充值',
          cancelText: '取消',
          onOk: () => {
            console.log('👉 跳转到充值页面');
            history.push('/orders/recharge');
          },
          onCancel: () => {
            console.log('❌ 用户取消充值');
          },
        });
      }
      
      return {
        sufficient,
        balance: currentBalance,
        price: currentPrice,
      };
    } catch (error) {
      console.error('❌ 检查余额异常:', error);
      return {
        sufficient: false,
        balance: 0,
        price: 0,
      };
    }
  }, [hasVipSubscription, vipRemainingDays, workflowType, getWorkflowPrice, refreshBalance, showModalOnInsufficient]);

  /**
   * 扣除金币
   */
  const consumeCoinsAction = useCallback(async (
    conversationId: number,
    price?: number
  ): Promise<boolean> => {
    try {
      // VIP 用户跳过扣款
      if (hasVipSubscription && vipRemainingDays > 0) {
        console.log('💎 VIP 用户跳过扣款');
        return true;
      }
      
      const currentPrice = price !== undefined ? price : getWorkflowPrice(workflowType);
      
      // 价格为 0 跳过扣款
      if (currentPrice <= 0) {
        console.log('💰 价格为 0，跳过扣款');
        return true;
      }
      
      const response = await consumeCoins({
        conversation_id: conversationId,
        amount: currentPrice,
        description: '口语练习',
      });
      
      if (response.success) {
        console.log(`✅ 成功扣除 ${currentPrice} 金币`);
        // 刷新余额
        await refreshBalance();
        return true;
      } else {
        console.error('❌ 扣除金币失败:', response.message);
        return false;
      }
    } catch (error) {
      console.error('❌ 扣除金币异常:', error);
      return false;
    }
  }, [hasVipSubscription, vipRemainingDays, workflowType, getWorkflowPrice, refreshBalance]);

  /**
   * 初始化（加载价格和 VIP 状态）
   */
  const initialize = useCallback(async () => {
    await Promise.all([
      loadWorkflowPrices(),
      refreshVipStatus(),
    ]);
    console.log('✅ 余额检查器初始化完成');
  }, [loadWorkflowPrices, refreshVipStatus]);

  return {
    hasVipSubscription,
    vipRemainingDays,
    balance,
    vipLoading,
    balanceLoading,
    checkBalance,
    consumeCoins: consumeCoinsAction,
    refreshBalance,
    refreshVipStatus,
    getWorkflowPrice,
    initialize,
    balanceChecked: balanceCheckedRef.current,
    setBalanceChecked: (checked: boolean) => {
      balanceCheckedRef.current = checked;
    },
  };
}

export default useBalanceChecker;
