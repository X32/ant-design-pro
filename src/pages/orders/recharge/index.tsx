import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Divider, Typography, Space, message, Modal, Spin } from 'antd';
import { CreditCardOutlined, GiftOutlined, StarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getCoinPackages, CoinPackage, createCoinOrder } from '@/services/ant-design-pro/api/coinPackages'; // 导入API函数

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
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null); // 初始不选择任何套餐
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // 页面加载状态

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
  }, []);

  const handleRecharge = async () => {
    if (selectedPackage === null) {
      message.warning('请选择一个充值套餐');
      return;
    }

    setLoading(true);
    try {
      // 调用创建订单API
      const response = await createCoinOrder({
        item_id: selectedPackage,
      });

      if (response.success && response.data) {
        const order = response.data;
        Modal.success({
          title: '订单创建成功！',
          content: (
            <div>
              <p>订单号：{order.order_no}</p>
              <p>商品：{order.item_name}</p>
              <p>金币数量：{order.coin_amount}</p>
              <p>金额：¥{order.total_amount}</p>
              <p>状态：{order.status}</p>
            </div>
          ),
          onOk: () => {
            // 这里可以跳转到支付页面或打开支付窗口
            console.log('订单创建成功，跳转到支付页面', order);
            // TODO: 实际的支付流程，例如跳转到支付页面
            // window.location.href = `/payment/${order.order_no}`;
          }
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

  if (pageLoading) {
    return (
      <div className="recharge-page">
        <div className="recharge-container" style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>正在加载金币套餐...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recharge-page">
      <div className="recharge-container">
        <div className="recharge-header">
          <Title level={2} className="recharge-title">
            <GiftOutlined style={{ marginRight: '12px' }} />
            金币充值中心
          </Title>
          <Paragraph className="recharge-subtitle">
            选择适合您的金币套餐，畅享AI口语练习服务
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} className="package-grid">
          {packages.map((pkg) => (
            <Col xs={24} sm={12} md={12} lg={6} key={pkg.id}>
              <Card
                className={`package-card ${selectedPackage === pkg.id ? 'package-card-selected' : ''}`}
                hoverable
                onClick={() => setSelectedPackage(pkg.id)}
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
                    type={selectedPackage === pkg.id ? 'primary' : 'default'}
                    size="large"
                    className="package-button"
                    icon={<CreditCardOutlined />}
                  >
                    {selectedPackage === pkg.id ? '已选择' : '选择此套餐'}
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="selected-package-info">
          <Space direction="vertical" size="large">
            <div>
              <Text strong style={{ fontSize: '18px' }}>
                已选择：{selectedPackage ? `${packages.find(pkg => pkg.id === selectedPackage)?.coins} 金币套餐` : '请选择套餐'} 
                {selectedPackage && ` - ¥${packages.find(pkg => pkg.id === selectedPackage)?.price.toFixed(2)}`}
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleRecharge}
              disabled={selectedPackage === null || packages.length === 0}
              style={{ 
                width: '200px', 
                height: '50px', 
                fontSize: '16px', 
                fontWeight: 'bold' 
              }}
              icon={<CreditCardOutlined />}
            >
              立即充值
            </Button>
          </Space>
        </div>

        <div className="payment-security">
          <Divider className="security-divider">安全支付保障</Divider>
          <Row justify="center" gutter={[40, 20]}>
            <Col>
              <Space direction="vertical" align="center">
                <div style={{ fontSize: '24px', color: '#52c41a' }}>🔒</div>
                <Text strong>SSL加密</Text>
              </Space>
            </Col>
            <Col>
              <Space direction="vertical" align="center">
                <div style={{ fontSize: '24px', color: '#1890ff' }}>💳</div>
                <Text strong>多种支付</Text>
              </Space>
            </Col>
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
    </div>
  );
};

export default RechargePage;