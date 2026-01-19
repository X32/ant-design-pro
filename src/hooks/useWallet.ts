import { useState, useCallback } from 'react';
import { getWalletBalance, consumeCoins } from '@/services/ant-design-pro/api';
import { App } from 'antd';

/**
 * 钱包数据类型
 */
export interface WalletData {
  user_id: number;
  balance: number;
  frozen_balance: number;
  exists: boolean;
}

/**
 * 消费结果数据类型
 */
export interface ConsumeResult {
  user_id: number;
  consumed_amount: number;
  balance_before: number;
  balance_after: number;
  log_id: number;
  biz_type: string;
  biz_id: number;
}

/**
 * 钱包 Hook
 * 用于管理用户金币钱包余额和支付
 */
export const useWallet = () => {
  const { message } = App.useApp();
  const [balance, setBalance] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 查询余额
   */
  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWalletBalance();
      if (response.success) {
        setBalance(response.data);
        return response.data;
      } else {
        message.error(response.message || '查询余额失败');
        return null;
      }
    } catch (error: any) {
      const errorMsg = error?.message || '查询余额失败';
      message.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [message]);

  /**
   * 金币支付
   * 
   * @param coinAmount - 消费金币数量
   * @param bizType - 业务类型
   * @param bizId - 业务ID
   * @param remark - 备注（可选）
   */
  const consume = useCallback(async (
    coinAmount: number,
    bizType: 'consume_conversation' | 'consume_practice' | 'consume_exam',
    bizId: number,
    remark?: string,
  ): Promise<ConsumeResult | null> => {
    setLoading(true);
    try {
      const response = await consumeCoins({
        coin_amount: coinAmount,
        biz_type: bizType,
        biz_id: bizId,
        remark,
      });

      if (response.success) {
        // 更新余额
        setBalance(prev => prev ? {
          ...prev,
          balance: response.data.balance_after,
        } : null);
        
        message.success(response.message || '支付成功');
        return response.data;
      } else {
        message.error(response.message || '支付失败');
        return null;
      }
    } catch (error: any) {
      const errorMsg = error?.message || '支付失败';
      
      // 处理特定错误
      if (errorMsg.includes('余额不足')) {
        message.error('金币余额不足，请先充值');
      } else if (errorMsg.includes('登录已过期') || errorMsg.includes('401')) {
        message.error('登录已过期，请重新登录');
      } else {
        message.error(errorMsg);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [message]);

  /**
   * 检查余额是否充足
   * 
   * @param requiredAmount - 需要的金币数量
   */
  const checkBalance = useCallback(async (requiredAmount: number): Promise<boolean> => {
    const walletData = balance || await fetchBalance();
    
    if (!walletData || !walletData.exists) {
      message.warning('钱包不存在，请先充值');
      return false;
    }

    if (walletData.balance < requiredAmount) {
      message.warning(`金币余额不足，当前余额：${walletData.balance}，需要：${requiredAmount}`);
      return false;
    }

    return true;
  }, [balance, fetchBalance, message]);

  return {
    balance,
    loading,
    fetchBalance,
    consume,
    checkBalance,
  };
};
