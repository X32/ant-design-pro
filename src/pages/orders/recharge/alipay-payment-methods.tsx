/**
 * 支付宝支付流程方法集合
 * 将这些方法集成到您的 /src/pages/orders/recharge/index.tsx 中
 */

import { message } from 'antd';
import { getAlipayPayUrl, getOrderStatus } from '@/services/ant-design-pro/api/coinPackages';

/**
 * 轮询查询订单状态
 * @param orderNo 订单号
 * @param maxAttempts 最大尝试次数（默认30次）
 * @param interval 轮询间隔（默认2000ms）
 * @returns 支付结果
 */
export const pollOrderStatus = async (
  orderNo: string,
  maxAttempts: number = 30,
  interval: number = 2000
): Promise<{ success: boolean; message: string; status?: string }> => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      console.log(`[轮询 ${i + 1}/${maxAttempts}] 查询订单状态:`, orderNo);
      
      const result = await getOrderStatus(orderNo);
      
      if (result.is_paid || result.status === 'COMPLETED') {
        // 支付成功
        return {
          success: true,
          message: '支付成功！金币已到账',
          status: result.status
        };
      }
      
      if (result.status === 'CANCELLED') {
        // 订单已取消
        return {
          success: false,
          message: '订单已取消',
          status: result.status
        };
      }
      
      // 等待后继续查询
      await new Promise(resolve => setTimeout(resolve, interval));
      
    } catch (error: any) {
      console.error(`[轮询错误 ${i + 1}] 查询订单状态失败:`, error);
    }
  }
  
  // 超时
  return {
    success: false,
    message: '支付超时，请稍后在"我的订单"中查看',
    status: 'TIMEOUT'
  };
};

/**
 * 处理支付宝支付流程
 * @param orderNo 订单号
 * @param orderInfo 订单基本信息
 * @param modal Ant Design Modal 实例
 * @param setShowCoinAnimation 金币雨动画控制函数
 */
export const handleAlipayPayment = async (
  orderNo: string,
  orderInfo: {
    order_no: string;
    item_name: string;
    coin_amount: number;
    total_amount: number;
  },
  modal: any,
  setShowCoinAnimation: (show: boolean) => void
) => {
  try {
    // 1. 获取支付宝支付链接
    console.log('开始支付宝支付，订单号:', orderNo);
    const payResponse = await getAlipayPayUrl({ order_no: orderNo });
    
    if (!payResponse.success) {
      message.error(payResponse.message || '获取支付链接失败');
      return;
    }
    
    message.loading('正在跳转到支付宝...', 1);
    
    // 2. 保存订单号到 sessionStorage
    sessionStorage.setItem('current_order_no', orderNo);
    sessionStorage.setItem('order_info', JSON.stringify(orderInfo));
    
    // 3. 跳转到支付宝支付页面
    setTimeout(() => {
      window.location.href = payResponse.pay_url;
    }, 1000);
    
  } catch (error: any) {
    console.error('支付宝支付流程错误:', error);
    message.error('支付失败，请稍后重试');
  }
};

/**
 * 检查支付结果（用于支付回调页面）
 * 当用户从支付宝返回时调用此方法
 */
export const checkPaymentResult = async (
  modal: any,
  setShowCoinAnimation: (show: boolean) => void,
  setLoading: (loading: boolean) => void
) => {
  const orderNo = sessionStorage.getItem('current_order_no');
  const orderInfoStr = sessionStorage.getItem('order_info');
  
  if (!orderNo) {
    console.log('没有待查询的订单');
    return;
  }
  
  // 🔥 立即清理 URL 参数，避免用户刷新页面时重复查询
  cleanUrlParams();
  
  setLoading(true);
  
  try {
    console.log('正在查询支付结果...');
    message.loading('正在查询支付结果...', 0);
    
    // 轮询查询订单状态
    const result = await pollOrderStatus(orderNo);
    
    message.destroy(); // 关闭 loading 提示
    
    // 清除 sessionStorage
    sessionStorage.removeItem('current_order_no');
    sessionStorage.removeItem('order_info');
    
    if (result.success) {
      // 支付成功
      message.success('支付成功！');
      
      // 触发金币雨动画
      setShowCoinAnimation(true);
      
      const orderInfo = orderInfoStr ? JSON.parse(orderInfoStr) : null;
      
      // 显示支付成功弹窗
      modal.success({
        title: '支付成功！',
        content: (
          <div>
            {orderInfo && (
              <>
                <p>订单号：{orderInfo.order_no}</p>
                <p>商品：{orderInfo.item_name}</p>
                <p>金币数量：{orderInfo.coin_amount}</p>
                <p>支付金额：￥{(orderInfo.total_amount / 100).toFixed(2)}</p>
              </>
            )}
            <p style={{ color: '#52c41a', fontWeight: 'bold', marginTop: 12 }}>
              金币已充值到账，请到个人中心查看！
            </p>
          </div>
        ),
        okText: '知道了',
        onOk: () => {
          // 可以选择刷新页面或跳转到其他页面
          // window.location.href = '/';
        }
      });
    } else {
      // 支付失败或超时
      modal.error({
        title: '支付失败',
        content: result.message,
        okText: '知道了'
      });
    }
  } catch (error) {
    console.error('查询支付结果失败:', error);
    message.error('查询支付结果失败');
  } finally {
    setLoading(false);
  }
};

/**
 * 清理 URL 参数（保留路径，移除查询参数）
 * 避免用户刷新页面时重复触发支付结果查询
 */
const cleanUrlParams = () => {
  const currentPath = window.location.pathname;
  window.history.replaceState({}, document.title, currentPath);
  console.log('已清理 URL 参数，当前路径:', currentPath);
};
