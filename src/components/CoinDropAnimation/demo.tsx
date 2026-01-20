/**
 * 金币雨动画组件使用示例
 * 
 * 本文件展示了如何在不同场景中使用 CoinDropAnimation 组件
 */

import React, { useState } from 'react';
import { Button, Space, Card, InputNumber } from 'antd';
import CoinDropAnimation from './index';
import coinSound from './corns.mp3';  // 导入音频文件

const CoinDropAnimationDemo: React.FC = () => {
  const [showAnimation1, setShowAnimation1] = useState(false);
  const [showAnimation2, setShowAnimation2] = useState(false);
  const [showAnimation3, setShowAnimation3] = useState(false);
  const [spawnRate, setSpawnRate] = useState(50);  // 改为 spawnRate

  return (
    <div style={{ padding: '24px' }}>
      <Card title="金币雨动画组件示例">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* 示例 1: 基本用法 */}
          <Card type="inner" title="示例 1: 金币雨效果（中等密度）">
            <p>适用场景：完成小任务、获得少量奖励</p>
            <Button 
              type="primary" 
              onClick={() => setShowAnimation1(true)}
            >
              触发动画（中等密度）
            </Button>
            <CoinDropAnimation
              visible={showAnimation1}
              spawnRate={50}  // 每50ms生成一个金币
              duration={3000}
              playSound={true}
              soundUrl={coinSound}  // 使用导入的音频文件
              fallSpeed={5}
              onComplete={() => {
                setShowAnimation1(false);
                console.log('动画完成！');
              }}
            />
          </Card>

          {/* 示例 2: 密集金币雨 */}
          <Card type="inner" title="示例 2: 密集金币雨（高密度）">
            <p>适用场景：支付成功、完成重要任务、获得大量奖励</p>
            <Button 
              type="primary" 
              onClick={() => setShowAnimation2(true)}
            >
              触发动画（密集金币雨）
            </Button>
            <CoinDropAnimation
              visible={showAnimation2}
              spawnRate={30}  // 更快的生成速度
              duration={5000}
              playSound={true}
              soundUrl={coinSound}
              fallSpeed={6}
              coinColor="#FFD700"
              onComplete={() => {
                setShowAnimation2(false);
                console.log('密集金币雨动画完成！');
              }}
            />
          </Card>

          {/* 示例 3: 自定义参数 */}
          <Card type="inner" title="示例 3: 自定义生成速度">
            <Space>
              <span>生成速度（ms）：</span>
              <InputNumber 
                min={10} 
                max={200} 
                value={spawnRate} 
                onChange={(val) => setSpawnRate(val || 50)} 
              />
              <span style={{ fontSize: '12px', color: '#999' }}>（值越小越密集）</span>
              <Button 
                type="primary" 
                onClick={() => setShowAnimation3(true)}
              >
                触发动画
              </Button>
            </Space>
            <CoinDropAnimation
              visible={showAnimation3}
              spawnRate={spawnRate}
              duration={3000}
              playSound={true}
              soundUrl={coinSound}
              fallSpeed={5}
              onComplete={() => setShowAnimation3(false)}
            />
          </Card>

          {/* 使用说明 */}
          <Card type="inner" title="使用说明">
            <h4>组件属性：</h4>
            <ul>
              <li><strong>visible</strong>: 是否显示动画（布尔值）</li>
              <li><strong>spawnRate</strong>: 金币生成速度，毫秒/个（默认 50，值越小越密集）</li>
              <li><strong>duration</strong>: 动画持续时间，单位毫秒（默认 3000）</li>
              <li><strong>playSound</strong>: 是否播放音效（默认 true）</li>
              <li><strong>soundUrl</strong>: 自定义音频文件URL（可选）</li>
              <li><strong>fallSpeed</strong>: 金币下落速度，像素/帧（默认 5）</li>
              <li><strong>coinColor</strong>: 金币颜色（默认 '#FFD700'）</li>
              <li><strong>width</strong>: 容器宽度（默认 400）</li>
              <li><strong>height</strong>: 容器高度（默认 600）</li>
              <li><strong>onComplete</strong>: 动画完成回调函数</li>
            </ul>

            <h4>使用场景：</h4>
            <ul>
              <li>✅ 用户完成任务后的奖励动画</li>
              <li>✅ 支付成功后的确认效果</li>
              <li>✅ 完成训练获得分数的反馈</li>
              <li>✅ 充值成功的视觉反馈</li>
              <li>✅ 签到打卡获得金币</li>
            </ul>

            <h4>代码示例：</h4>
            <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`import CoinDropAnimation from '@/components/CoinDropAnimation';
import coinSound from '@/components/CoinDropAnimation/corns.mp3';

const [showCoins, setShowCoins] = useState(false);

// 支付成功后触发
const handlePaymentSuccess = () => {
  setShowCoins(true);
};

<CoinDropAnimation
  visible={showCoins}
  spawnRate={50}  // 生成速度
  duration={3000}
  playSound={true}
  soundUrl={coinSound}  // 使用自定义音频
  fallSpeed={5}
  onComplete={() => setShowCoins(false)}
/>`}
            </pre>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default CoinDropAnimationDemo;
