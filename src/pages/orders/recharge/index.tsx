import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Divider, Typography, Space, message, Modal, Spin, App, Radio, Tabs, Badge } from 'antd';
import { CreditCardOutlined, GiftOutlined, StarOutlined, CheckCircleOutlined, AlipayOutlined, TransactionOutlined, ArrowLeftOutlined, CrownOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { getCoinPackages, CoinPackage, createCoinOrder, mockPayOrder, getOrderDetail } from '@/services/ant-design-pro/api/coinPackages'; // 导入API函数 (mockPayOrder 仅用于本地测试)
import { getVipPlans, VipSubscriptionPlan, ExamLevel, createSubscriptionOrder } from '@/services/ant-design-pro/api/vipSubscription'; // 导入VIP套餐API
import CoinDropAnimation from '@/components/CoinDropAnimation';  // 导入金币雨动画组件
import coinSound from '@/components/CoinDropAnimation/corns.mp3';  // 导入音频文件
import { pollOrderStatus, handleAlipayPayment, checkPaymentResult } from './alipay-payment-methods';  // 导入支付宝支付方法
import UserAvatar from '@/components/UserAvatar';  // 导入用户头像组件

import './index.less'; // 引入样式文件

const { Title, Text, Paragraph } = Typography;

interface PackageItem {
  id: number;
  coins: number;
  price: number;
  discount: string;
  popular: boolean;
  features: string[];
}

const RechargePage: React.FC = () => {
  const { modal } = App.useApp();  // 使用 App 组件提供的 modal API
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null); // 初始不选择任何套餐
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // 页面加载状态
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);  // 控制金币雨动画显示
  
  // VIP套餐相关状态
  const [vipPlans, setVipPlans] = useState<VipSubscriptionPlan[]>([]); // 改为简单数组
  const [selectedVipLevel] = useState<ExamLevel>('ALL'); // 固定为ALL，不再切换
  const [selectedVipPlan, setSelectedVipPlan] = useState<number | null>(null); // 选中的VIP套餐ID
  const [vipLoading, setVipLoading] = useState(true);

  // 获取VIP套餐数据
  useEffect(() => {
    const fetchVipPlans = async () => {
      try {
        setVipLoading(true);
        const response = await getVipPlans();
        if (response.success && response.data) {
          setVipPlans(response.data.plans); // 从 data.plans 获取数组
          console.log('VIP套餐数据:', response.data);
        } else {
          message.error(response.message || '获取VIP套餐失败');
        }
      } catch (error) {
        console.error('获取VIP套餐失败:', error);
        message.error('获取VIP套餐失败，请稍后重试');
      } finally {
        setVipLoading(false);
      }
    };

    fetchVipPlans();
  }, []);

  // 获取金币套餐数据
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await getCoinPackages();
        if (response.success && response.data) {
          // 将API返回的数据转换为页面所需的格式
          const formattedPackages = response.data.map((pkg: CoinPackage) => ({
            id: pkg.id,
            coins: pkg.coin_amount,
            price: pkg.price / 100, // 假设后端价格单位是分，前端显示元
            discount: '', // 后端未提供折扣信息，暂时为空
            popular: pkg.id === 2, // 假设ID为2的是推荐套餐
            features: [
              `${pkg.coin_amount}金币`,
              '可用于口语练习',
              '有效期永久',
              ...(pkg.id === 2 ? ['专享客服'] : []),
              ...(pkg.id === 3 ? ['专享客服', '优先体验'] : []),
              ...(pkg.id === 4 ? ['专享客服', '优先体验', '专属徽章'] : [])
            ]
          }));
          
          setPackages(formattedPackages);
          
          // 设置默认选中推荐套餐
          const recommendedPackage = formattedPackages.find(pkg => pkg.popular);
          if (recommendedPackage) {
            setSelectedPackage(recommendedPackage.id);
          } else if (formattedPackages.length > 0) {
            setSelectedPackage(formattedPackages[0].id);
          }
        } else {
          message.error(response.message || '获取金币套餐失败');
        }
      } catch (error) {
        console.error('获取金币套餐失败:', error);
        message.error('获取金币套餐失败，请稍后重试');
        
        // 使用模拟数据作为备选方案
        const mockPackages: PackageItem[] = [
          {
            id: 1,
            coins: 100,
            price: 9.9,
            discount: '节省 ¥0.0',
            popular: false,
            features: ['100金币', '可用于口语练习', '有效期永久'],
          },
          {
            id: 2,
            coins: 300,
            price: 25.9,
            discount: '节省 ¥3.8',
            popular: true,
            features: ['300金币', '可用于口语练习', '有效期永久', '专享客服'],
          },
          {
            id: 3,
            coins: 500,
            price: 39.9,
            discount: '节省 ¥9.6',
            popular: false,
            features: ['500金币', '可用于口语练习', '有效期永久', '专享客服', '优先体验'],
          },
          {
            id: 4,
            coins: 1000,
            price: 69.9,
            discount: '节省 ¥29.1',
            popular: false,
            features: ['1000金币', '可用于口语练习', '有效期永久', '专享客服', '优先体验', '专属徽章'],
          },
        ];
        setPackages(mockPackages);
        setSelectedPackage(2);
      } finally {
        setPageLoading(false);
      }
    };

    fetchPackages();
    
    // 检查是否从支付宝支付返回（通过URL参数判断）
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'alipay') {
      checkPaymentResult(modal, setShowCoinAnimation, setLoading);
    }
  }, []);

  /**
   * 处理支付流程
   * ⚠️ 仅用于本地测试环境，生产环境已禁用入口
   * @param orderNo 订单号
   * @param orderInfo 订单基本信息（用于显示）
   */
  const handlePayment = async (orderNo: string, orderInfo: {
    order_no: string;
    item_name: string;
    coin_amount: number;
    total_amount: number;
  }) => {
    try {
      // 1. 调用模拟支付接口
      console.log('开始模拟支付，订单号:', orderNo);
      const payResponse = await mockPayOrder({ order_no: orderNo });
      
      if (payResponse.success) {
        message.success('支付成功！');
        
        // 🎉 触发金币雨动画
        setShowCoinAnimation(true);
        
        // 2. 查询订单详情确认状态
        console.log('查询订单详情...');
        const orderDetailResponse = await getOrderDetail(orderNo);
        
        if (orderDetailResponse.success) {
          const updatedOrder = orderDetailResponse.data;
          console.log('订单详情:', updatedOrder);
          
          // 3. 显示支付成功的订单信息
          modal.success({
            title: '支付成功！',
            content: (
              <div>
                <p>订单号：{updatedOrder.order_no}</p>
                <p>商品：{updatedOrder.item_name}</p>
                <p>金币数量：{updatedOrder.coin_amount}</p>
                <p>支付金额：￥{(updatedOrder.total_amount/100).toFixed(2)}</p>
                <p>订单状态：{updatedOrder.status === 'paid' ? '已支付' : updatedOrder.status}</p>
                <p style={{ color: '#52c41a', fontWeight: 'bold', marginTop: 12 }}>
                  金币已充值到账，请到个人中心查看！
                </p>
              </div>
            ),
            okText: '知道了',
          });
        } else {
          message.error('查询订单详情失败');
        }
      } else {
        message.error(payResponse.message || '支付失败');
      }
    } catch (error: any) {
      console.error('支付流程错误:', error);
      message.error('支付失败，请稍后重试');
    }
  };

  /**
   * 处理VIP订阅（创建VIP订单）
   */
  const handleVipSubscribe = async (planId: number) => {
    setLoading(true);
    try {
      // 调用创建VIP订阅订单API
      const response = await createSubscriptionOrder({
        plan_id: planId,
        pay_channel: 'alipay', // VIP订阅目前只支持支付宝
      });

      if (response.success && response.data) {
        const order = response.data;
        
        // 使用临时变量存储支付方式选择
        let tempPaymentMethod: 'alipay' | 'mock' = 'alipay';
        
        modal.confirm({
          title: 'VIP订阅订单创建成功！',
          content: (
            <div>
              <p>订单号：{order.order_no}</p>
              <p>套餐：{order.plan_name}</p>
              <p>级别：{order.exam_level}</p>
              <p>时长：{order.duration_days}天</p>
              <p>金额：¥{(order.amount / 100).toFixed(2)}</p>
              {order.is_first_buy && (
                <p style={{ color: '#52c41a' }}>🎉 首购优惠价</p>
              )}
              
              <Divider style={{ margin: '16px 0' }}>选择支付方式</Divider>
              <Radio.Group 
                defaultValue="alipay"
                onChange={(e) => {
                  tempPaymentMethod = e.target.value;
                  console.log('选择支付方式:', tempPaymentMethod);
                }}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="alipay" style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                    <Space>
                      <AlipayOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                      <span>支付宝支付</span>
                    </Space>
                  </Radio>
                  {/* <Radio value="mock" style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                    <Space>
                      <TransactionOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                      <span>模拟支付（测试）</span>
                    </Space>
                  </Radio> */}
                </Space>
              </Radio.Group>
            </div>
          ),
          okText: '立即支付',
          cancelText: '稍后支付',
          width: 500,
          onOk: () => {
            // 构造订单信息对象，格式与金币订单一致
            const orderInfo = {
              order_no: order.order_no,
              item_name: order.plan_name,
              coin_amount: 0, // VIP订阅不涉及金币
              total_amount: order.amount,
            };
            
            console.log('执行支付，支付方式:', tempPaymentMethod);
            if (tempPaymentMethod === 'alipay') {
              // 使用支付宝支付流程
              handleAlipayPayment(order.order_no, orderInfo, modal, setShowCoinAnimation, 'vip');
            } else {
              // 使用模拟支付
              handleMockPayment(order.order_no, orderInfo, 'vip');
            }
          },
          onCancel: () => {
            message.info('订单已创建，您可以稍后在订单列表中继续支付');
          },
        });
      } else {
        message.error(response.message || '创建VIP订阅订单失败');
      }
    } catch (error: any) {
      console.error('创建VIP订阅订单失败:', error);
      let errorMessage = '创建VIP订阅订单失败，请稍后重试';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((item: any) => item.msg).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理模拟支付（VIP和金币通用）
   * ⚠️ 仅用于本地测试环境，生产环境已禁用入口
   * @param orderNo 订单号
   * @param orderInfo 订单信息
   * @param orderType 订单类型 'vip' | 'coin'
   */
  const handleMockPayment = async (
    orderNo: string,
    orderInfo: {
      order_no: string;
      item_name: string;
      coin_amount: number;
      total_amount: number;
    },
    orderType: 'vip' | 'coin'
  ) => {
    try {
      setLoading(true);
      console.log('开始模拟支付，订单号:', orderNo);
      
      // 调用模拟支付接口
      const payResponse = await mockPayOrder({ order_no: orderNo });
      
      if (payResponse.success) {
        message.success('支付成功！');
        
        // 只有金币充值才触发金币雨动画
        if (orderType === 'coin') {
          setShowCoinAnimation(true);
        }
        
        // 查询订单详情确认状态
        console.log('查询订单详情...');
        const orderDetailResponse = await getOrderDetail(orderNo);
        
        if (orderDetailResponse.success) {
          const updatedOrder = orderDetailResponse.data;
          console.log('订单详情:', updatedOrder);
          
          // 根据订单类型显示不同的支付成功弹窗
          if (orderType === 'vip') {
            // VIP订阅成功弹窗
            modal.success({
              title: '🎉 VIP订阅成功！',
              content: (
                <div>
                  <p>订单号：{updatedOrder.order_no}</p>
                  <p>套餐：{orderInfo.item_name}</p>
                  <p>支付金额：￥{(orderInfo.total_amount / 100).toFixed(2)}</p>
                  <p style={{ color: '#faad14', fontWeight: 'bold', marginTop: 12, fontSize: '16px' }}>
                    👑 恭喜您成为VIP会员！
                  </p>
                  <p style={{ color: '#52c41a', marginTop: 8 }}>
                    现在可以无限次练习对应级别的考试题目了！
                  </p>
                </div>
              ),
              okText: '知道了',
            });
          } else {
            // 金币充值成功弹窗
            modal.success({
              title: '💰 充值成功！',
              content: (
                <div>
                  <p>订单号：{updatedOrder.order_no}</p>
                  <p>商品：{updatedOrder.item_name}</p>
                  <p>金币数量：{updatedOrder.coin_amount}</p>
                  <p>支付金额：￥{(updatedOrder.total_amount/100).toFixed(2)}</p>
                  <p>订单状态：{updatedOrder.status === 'paid' ? '已支付' : updatedOrder.status}</p>
                  <p style={{ color: '#52c41a', fontWeight: 'bold', marginTop: 12 }}>
                    金币已充值到账，请到个人中心查看！
                  </p>
                </div>
              ),
              okText: '知道了',
            });
          }
        } else {
          message.error('查询订单详情失败');
        }
      } else {
        message.error(payResponse.message || '支付失败');
      }
    } catch (error: any) {
      console.error('模拟支付流程错误:', error);
      message.error('支付失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理金币充值（创建金币订单）
   */
  const handleCoinRecharge = async (packageId: number) => {
    setLoading(true);
    try {
      // 调用创建订单API，传递支付渠道参数
      const response = await createCoinOrder({
        item_id: packageId,
        pay_channel: 'alipay', // 金币充值使用支付宝
      });

      if (response.success && response.data) {
        const order = response.data;
        
        // 使用临时变量存储支付方式选择
        let tempPaymentMethod: 'alipay' | 'mock' = 'alipay';
        
        modal.confirm({
          title: '金币充值订单创建成功！',
          content: (
            <div>
              <p>订单号：{order.order_no}</p>
              <p>商品：{order.item_name}</p>
              <p>金币数量：{order.coin_amount}</p>
              <p>金额：¥{(order.total_amount/100).toFixed(2)}</p>
              
              <Divider style={{ margin: '16px 0' }}>选择支付方式</Divider>
              <Radio.Group 
                defaultValue="alipay"
                onChange={(e) => {
                  tempPaymentMethod = e.target.value;
                  console.log('选择支付方式:', tempPaymentMethod);
                }}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="alipay" style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                    <Space>
                      <AlipayOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                      <span>支付宝支付</span>
                    </Space>
                  </Radio>
                  {/* 模拟支付选项 - 仅用于本地测试，上线时已隐藏 */}
                  {/* <Radio value="mock" style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                    <Space>
                      <TransactionOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                      <span>模拟支付（测试）</span>
                    </Space>
                  </Radio> */}
                </Space>
              </Radio.Group>
            </div>
          ),
          okText: '立即支付',
          cancelText: '稍后支付',
          width: 500,
          onOk: () => {
            console.log('执行支付，支付方式:', tempPaymentMethod);
            if (tempPaymentMethod === 'alipay') {
              // 使用支付宝支付流程
              handleAlipayPayment(order.order_no, order, modal, setShowCoinAnimation, 'coin');
            } else {
              // 使用模拟支付
              handleMockPayment(order.order_no, order, 'coin');
            }
          },
          onCancel: () => {
            message.info('订单已创建，您可以稍后在订单列表中继续支付');
          },
        });
      } else {
        message.error(response.message || '创建订单失败');
      }
    } catch (error: any) {
      console.error('创建订单失败:', error);
      let errorMessage = '创建订单失败，请稍后重试';
      
      // 如果错误包含详细信息，提取出来显示
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((item: any) => item.msg).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading || vipLoading) {
    return (
      <div className="recharge-page">
        <div className="recharge-container" style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>正在加载套餐...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recharge-page">
      {/* 顶部导航栏 */}
      <div className="recharge-navbar">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.back()}
          className="back-button"
          size="large"
        >
          返回
        </Button>
        <UserAvatar showName={false} size={40} />
      </div>

      <div className="recharge-container">
        <div className="recharge-header">
          <Title level={2} className="recharge-title">
            <GiftOutlined style={{ marginRight: '12px' }} />
            充值中心
          </Title>
          <Paragraph className="recharge-subtitle">
            选择VIP订阅套餐或金币充值套餐，畅享AI口语练习服务
          </Paragraph>
        </div>

        {/* ==================== VIP订阅套餐区域 ==================== */}
        <div className="vip-section" style={{ marginBottom: '60px' }}>
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <Title level={3} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <CrownOutlined style={{ marginRight: '8px', color: '#faad14' }} />
              VIP订阅套餐
              <Badge 
                count="推荐" 
                style={{ 
                  backgroundColor: '#faad14', 
                  marginLeft: '12px',
                  fontSize: '12px'
                }} 
              />
            </Title>
            <Paragraph type="secondary">
              订阅后可无限次练习对应级别的考试题目，更高效的学习方式
            </Paragraph>
          </div>

          {/* 全级别通用标题 */}
          <div style={{ 
            marginBottom: '24px', 
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #fffbf0 0%, #fff9e6 100%)',
            borderRadius: '8px',
            border: '2px solid #faad14',
            textAlign: 'center'
          }}>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#faad14',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <CrownOutlined style={{ fontSize: '20px' }} />
              全级别通用会员（KET/PET/FCE）
            </span>
          </div>

          {/* VIP套餐卡片 */}
          <Row gutter={[24, 24]}>
            {vipPlans.map((plan) => {
              const isRecommended = plan.is_recommended === 1;
              const displayPrice = plan.first_buy_price || plan.original_price;
              const hasDiscount = plan.first_buy_price && plan.first_buy_price < plan.original_price;
              const isSelected = selectedVipPlan === plan.id;
              
              return (
                <Col xs={24} sm={12} md={8} key={plan.id}>
                  <Card
                    className={`package-card vip-card ${isSelected ? 'package-card-selected' : ''}`}
                    hoverable
                    onClick={() => {
                      setSelectedVipPlan(plan.id);
                      setSelectedPackage(null); // 清除金币套餐选择
                    }}
                  >
                    {isRecommended && (
                      <div className="package-popular-tag" style={{ background: '#faad14' }}>
                        最划算
                      </div>
                    )}
                    
                    <div className="package-content">
                      <div className="package-icon" style={{ color: '#faad14' }}>
                        <CrownOutlined />
                      </div>
                      
                      <Title level={3} className="package-name">
                        {plan.plan_name}
                      </Title>
                      
                      <Paragraph type="secondary" style={{ minHeight: '44px' }}>
                        {plan.description}
                      </Paragraph>
                      
                      <div style={{ margin: '15px 0' }}>
                        {hasDiscount && (
                          <Text delete type="secondary" className="package-price-original">
                            ¥{(plan.original_price / 100).toFixed(2)}
                          </Text>
                        )}
                        <Title level={2} className="package-price-current" style={{ color: '#faad14' }}>
                          ¥{(displayPrice / 100).toFixed(2)}
                        </Title>
                        {hasDiscount && (
                          <Text type="secondary" style={{ display: 'block', color: '#52c41a' }}>
                            首购特惠 省¥{((plan.original_price - plan.first_buy_price) / 100).toFixed(2)}
                          </Text>
                        )}
                        <Text type="secondary" style={{ display: 'block' }}>
                          {plan.duration_days}天有效期
                        </Text>
                      </div>
                      
                      <Divider style={{ margin: '15px 0' }} />
                      
                      <div className="package-features">
                        <div className="package-feature-item">
                          <CheckCircleOutlined className="package-feature-icon" />
                          <span>
                            {plan.exam_level === 'ALL' 
                              ? '无限次所有级别练习（KET/PET/FCE）' 
                              : `无限次${plan.exam_level}练习`}
                          </span>
                        </div>
                        <div className="package-feature-item">
                          <CheckCircleOutlined className="package-feature-icon" />
                          <span>{plan.duration_days}天有效期</span>
                        </div>
                        <div className="package-feature-item">
                          <CheckCircleOutlined className="package-feature-icon" />
                          <span>AI实时反馈</span>
                        </div>
                        <div className="package-feature-item">
                          <CheckCircleOutlined className="package-feature-icon" />
                          <span>专属学习报告</span>
                        </div>
                        {isRecommended && (
                          <div className="package-feature-item">
                            <CheckCircleOutlined className="package-feature-icon" />
                            <span>专享客服支持</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        type="primary"
                        size="large"
                        className="package-button"
                        icon={<CrownOutlined />}
                        loading={loading && isSelected}
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          handleVipSubscribe(plan.id);
                        }}
                        style={{ 
                          background: isSelected 
                            ? 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)'
                            : 'linear-gradient(135deg, #fadb14 0%, #ffe58f 100%)',
                          borderColor: '#faad14'
                        }}
                      >
                        {isSelected ? '立即订阅' : '选择此套餐'}
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* 如果没有套餐数据 */}
          {!vipPlans || vipPlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">暂无VIP套餐</Text>
            </div>
          ) : null}
        </div>

        {/* ==================== 金币充值套餐区域 ==================== */}
        <div className="coin-section">
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <Title level={3} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <GiftOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              金币充值套餐
            </Title>
            <Paragraph type="secondary">
              按次付费，灵活使用金币进行口语练习
            </Paragraph>
          </div>

        <Row gutter={[24, 24]} className="package-grid">
          {packages.map((pkg) => {
            const isSelected = selectedPackage === pkg.id;
            
            return (
            <Col xs={24} sm={12} md={12} lg={6} key={pkg.id}>
              <Card
                className={`package-card ${isSelected ? 'package-card-selected' : ''}`}
                hoverable
                onClick={() => {
                  setSelectedPackage(pkg.id);
                  setSelectedVipPlan(null); // 清除VIP套餐选择
                }}
              >
                {pkg.popular && (
                  <div className="package-popular-tag">
                    推荐
                  </div>
                )}
                
                <div className="package-content">
                  <div className="package-icon">
                    <StarOutlined />
                  </div>
                  <Title level={3} className="package-name">
                    {pkg.coins} 金币
                  </Title>
                  
                  <div style={{ margin: '15px 0' }}>
                    <Text delete type="secondary" className="package-price-original">
                      ¥{(pkg.price * 1.2).toFixed(2)}
                    </Text>
                    <Title level={2} className="package-price-current">
                      ¥{pkg.price.toFixed(2)}
                    </Title>
                    <Text type="secondary" style={{ display: 'block' }}>
                      {pkg.discount}
                    </Text>
                  </div>
                  
                  <Divider style={{ margin: '15px 0' }} />
                  
                  <div className="package-features">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="package-feature-item">
                        <CheckCircleOutlined className="package-feature-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    type={isSelected ? 'primary' : 'default'}
                    size="large"
                    className="package-button"
                    icon={<CreditCardOutlined />}
                    loading={loading && isSelected}
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡
                      handleCoinRecharge(pkg.id);
                    }}
                  >
                    {isSelected ? '立即购买' : '选择此套餐'}
                  </Button>
                </div>
              </Card>
            </Col>
            );
          })}
        </Row>

        <div className="payment-security">
          <Divider className="security-divider">安全支付保障</Divider>
          <Row justify="center" gutter={[40, 20]}>
            <Col>
              <Space direction="vertical" align="center">
                <div style={{ fontSize: '24px', color: '#52c41a' }}>🔒</div>
                <Text strong>SSL加密</Text>
              </Space>
            </Col>
            {/* <Col>
              <Space direction="vertical" align="center">
                <div style={{ fontSize: '24px', color: '#1890ff' }}>💳</div>
                <Text strong>多种支付</Text>
              </Space>
            </Col> */}
            <Col>
              <Space direction="vertical" align="center">
                <div style={{ fontSize: '24px', color: '#faad14' }}>⚡</div>
                <Text strong>即时到账</Text>
              </Space>
            </Col>
            <Col>
              <Space direction="vertical" align="center">
                <div style={{ fontSize: '24px', color: '#722ed1' }}>🛡️</div>
                <Text strong>资金安全</Text>
              </Space>
            </Col>
          </Row>
        </div>
        </div>
        {/* 金币充值区域结束 */}

      </div>
      {/* recharge-container 结束 */}
      
      {/* 金币雨动画 */}
      <CoinDropAnimation
        visible={showCoinAnimation}
        spawnRate={30}  // 密集金币雨
        duration={4000}  // 持续4秒
        playSound={true}
        soundUrl={coinSound}
        fallSpeed={6}
        width={window.innerWidth}  // 全屏宽度
        height={window.innerHeight}  // 全屏高度
        onComplete={() => {
          setShowCoinAnimation(false);
          console.log('金币雨动画完成');
        }}
      />
    </div>
  );
};

export default RechargePage;