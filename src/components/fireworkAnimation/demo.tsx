/**
 * 烟花动画组件使用示例
 * 
 * 本文件展示了如何在不同场景中使用 FireworkAnimation 组件
 */

import React, { useState } from 'react';
import { Button, Space, Card, Switch, InputNumber } from 'antd';
import FireworkAnimation from './index';
import winSound from './win.mp3';  // 导入音频文件

const FireworkAnimationDemo: React.FC = () => {
  const [showAnimation1, setShowAnimation1] = useState(false);
  const [showAnimation2, setShowAnimation2] = useState(false);
  const [showAnimation3, setShowAnimation3] = useState(false);
  const [fireworkCount, setFireworkCount] = useState(15);
  const [showTrophy, setShowTrophy] = useState(true);

  return (
    <div style={{ padding: '24px' }}>
      <Card title="烟花动画组件示例">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* 示例 1: 基本用法 */}
          <Card type="inner" title="示例 1: 基本烟花效果（默认配置）">
            <p>适用场景：完成重要任务、获得成就、通关成功</p>
            <Button 
              type="primary" 
              onClick={() => setShowAnimation1(true)}
            >
              触发动画（默认效果）
            </Button>
            <FireworkAnimation
              visible={showAnimation1}
              duration={5000}
              fireworkCount={15}
              playSound={true}
              showTrophy={true}
              backgroundColor="transparent"  // 透明背景
              soundUrl={winSound}  // 使用导入的音频文件
              onComplete={() => {
                setShowAnimation1(false);
                console.log('烟花动画完成！');
              }}
            />
          </Card>

          {/* 示例 2: 密集烟花 */}
          <Card type="inner" title="示例 2: 密集烟花效果">
            <p>适用场景：重大成就、比赛获胜、完美通关</p>
            <Button 
              type="primary" 
              onClick={() => setShowAnimation2(true)}
            >
              触发动画（密集烟花）
            </Button>
            <FireworkAnimation
              visible={showAnimation2}
              duration={6000}
              fireworkCount={25}
              playSound={true}
              showTrophy={true}
              backgroundColor="transparent"  // 透明背景
              soundUrl={winSound}  // 使用导入的音频文件
              onComplete={() => {
                setShowAnimation2(false);
                console.log('密集烟花动画完成！');
              }}
            />
          </Card>

          {/* 示例 3: 自定义参数 */}
          <Card type="inner" title="示例 3: 自定义配置">
            <Space direction="vertical" size="middle">
              <Space>
                <span>烟花数量：</span>
                <InputNumber 
                  min={5} 
                  max={50} 
                  value={fireworkCount} 
                  onChange={(val) => setFireworkCount(val || 15)} 
                />
              </Space>
              <Space>
                <span>显示奖杯：</span>
                <Switch 
                  checked={showTrophy} 
                  onChange={setShowTrophy} 
                />
              </Space>
              <Button 
                type="primary" 
                onClick={() => setShowAnimation3(true)}
              >
                触发动画
              </Button>
            </Space>
            <FireworkAnimation
              visible={showAnimation3}
              duration={5000}
              fireworkCount={fireworkCount}
              playSound={true}
              showTrophy={showTrophy}
              backgroundColor="transparent"  // 透明背景
              soundUrl={winSound}  // 使用导入的音频文件
              onComplete={() => setShowAnimation3(false)}
            />
          </Card>

          {/* 使用说明 */}
          <Card type="inner" title="使用说明">
            <h4>组件属性：</h4>
            <ul>
              <li><strong>visible</strong>: 是否显示动画（布尔值）</li>
              <li><strong>duration</strong>: 动画持续时间，单位毫秒（默认 5000）</li>
              <li><strong>fireworkCount</strong>: 烟花发射数量（默认 15）</li>
              <li><strong>playSound</strong>: 是否播放音效（默认 true）</li>
              <li><strong>soundUrl</strong>: 自定义音频文件URL（可选）</li>
              <li><strong>trophyImage</strong>: 奖杯图片路径（默认使用 cup_1.png）</li>
              <li><strong>showTrophy</strong>: 是否显示奖杯（默认 true）</li>
              <li><strong>width</strong>: 容器宽度（默认全屏）</li>
              <li><strong>height</strong>: 容器高度（默认全屏）</li>
              <li><strong>backgroundColor</strong>: 背景颜色（默认 'transparent' 透明）</li>
              <li><strong>onComplete</strong>: 动画完成回调函数</li>
            </ul>

            <h4>使用场景：</h4>
            <ul>
              <li>✅ 完成重要任务、获得成就</li>
              <li>✅ 比赛获胜、竞赛第一名</li>
              <li>✅ 考试通过、等级提升</li>
              <li>✅ 完美通关、打破记录</li>
              <li>✅ 活动庆祝、特殊节日</li>
            </ul>

            <h4>动画特点：</h4>
            <ul>
              <li>🎆 逼真的烟花爆炸效果</li>
              <li>🏆 中心奖杯带弹跳和发光动画</li>
              <li>🎨 多彩粒子系统</li>
              <li>🔊 支持自定义音效</li>
              <li>📱 响应式适配</li>
            </ul>

            <h4>代码示例：</h4>
            <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`import FireworkAnimation from '@/components/fireworkAnimation';

const [showFirework, setShowFirework] = useState(false);

// 完成任务后触发
const handleTaskComplete = () => {
  setShowFirework(true);
};

<FireworkAnimation
  visible={showFirework}
  duration={5000}
  fireworkCount={15}
  playSound={true}
  showTrophy={true}
  onComplete={() => setShowFirework(false)}
/>`}
            </pre>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default FireworkAnimationDemo;
