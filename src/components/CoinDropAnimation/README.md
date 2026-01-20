# CoinDropAnimation 金币掉落动画组件

一个使用 Canvas 2D 粒子系统实现的金币掉落动画组件，适用于奖励反馈、支付成功等场景。

## ✨ 特性

- 🎯 **Canvas 2D 粒子系统**：高性能渲染，支持大量金币同时掉落
- 🌟 **真实物理效果**：包含重力、弹跳、摩擦力等物理模拟
- 💫 **视觉效果丰富**：金币旋转、闪烁、缩放等多重效果
- 🔊 **音效支持**：金币碰撞声音（使用 Web Audio API）
- ⚙️ **高度可配置**：金币数量、颜色、速度、堆积模式等均可自定义
- 📱 **响应式设计**：支持自适应容器大小
- 🎮 **易于集成**：简单的 API，开箱即用

## 📦 安装

组件已集成在项目中，直接引入即可：

```typescript
import CoinDropAnimation from '@/components/CoinDropAnimation';
```

## 🎯 使用场景

- ✅ 用户完成任务后的奖励动画
- ✅ 支付成功后的确认效果
- ✅ 完成训练获得分数的反馈
- ✅ 充值成功的视觉反馈
- ✅ 签到打卡获得金币
- ✅ 游戏化奖励展示

## 🚀 基本用法

```tsx
import React, { useState } from 'react';
import { Button } from 'antd';
import CoinDropAnimation from '@/components/CoinDropAnimation';

const MyComponent = () => {
  const [showCoins, setShowCoins] = useState(false);

  const handleSuccess = () => {
    setShowCoins(true);
  };

  return (
    <>
      <Button onClick={handleSuccess}>触发奖励</Button>
      
      <CoinDropAnimation
        visible={showCoins}
        coinCount={20}
        duration={3000}
        playSound={true}
        onComplete={() => setShowCoins(false)}
      />
    </>
  );
};
```

## 📝 API

### Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| visible | 是否显示动画 | `boolean` | `false` | 否 |
| coinCount | 金币数量 | `number` | `20` | 否 |
| duration | 动画持续时间（毫秒） | `number` | `3000` | 否 |
| playSound | 是否播放音效 | `boolean` | `true` | 否 |
| shouldPile | 是否堆积（false 则消失） | `boolean` | `false` | 否 |
| coinColor | 金币颜色 | `string` | `'#FFD700'` | 否 |
| width | 容器宽度（像素） | `number` | `400` | 否 |
| height | 容器高度（像素） | `number` | `600` | 否 |
| onComplete | 动画完成回调 | `() => void` | - | 否 |

## 🎨 使用示例

### 示例 1：少量金币（任务完成）

```tsx
<CoinDropAnimation
  visible={showAnimation}
  coinCount={10}
  duration={2000}
  playSound={true}
  shouldPile={false}
  onComplete={() => setShowAnimation(false)}
/>
```

**效果**：10个金币从顶部掉落，掉落到底部后逐渐消失

---

### 示例 2：大量金币 + 堆积效果（重要奖励）

```tsx
<CoinDropAnimation
  visible={showAnimation}
  coinCount={50}
  duration={4000}
  playSound={true}
  shouldPile={true}
  coinColor="#FFD700"
  onComplete={() => setShowAnimation(false)}
/>
```

**效果**：50个金币掉落并堆积在底部，营造丰富感

---

### 示例 3：支付成功反馈

```tsx
const handlePaymentSuccess = async () => {
  // 支付成功
  await paymentAPI();
  
  // 触发金币动画
  setShowCoins(true);
  
  // 显示成功提示
  message.success('支付成功！');
};

<CoinDropAnimation
  visible={showCoins}
  coinCount={30}
  duration={3000}
  playSound={true}
  shouldPile={false}
  onComplete={() => {
    setShowCoins(false);
    // 跳转到下一页
    history.push('/success');
  }}
/>
```

---

### 示例 4：自定义颜色和大小

```tsx
<CoinDropAnimation
  visible={showAnimation}
  coinCount={25}
  duration={3500}
  playSound={true}
  shouldPile={true}
  coinColor="#FF6B6B"  // 红色金币
  width={600}          // 更宽的容器
  height={800}         // 更高的容器
  onComplete={() => setShowAnimation(false)}
/>
```

## 🎮 物理效果说明

组件模拟了真实的物理效果：

- **重力**：金币受重力影响向下加速
- **弹跳**：金币碰到底部或边缘会弹起
- **摩擦力**：金币在地面上会逐渐减速
- **空气阻力**：金币在空中运动时受到阻力
- **旋转**：每个金币都有独立的旋转速度
- **闪烁**：基于时间的正弦波，模拟金币反光效果

## 🔊 音效说明

组件使用 Web Audio API 生成简单的音效：

- 金币第一次碰撞时播放"叮"的声音
- 频率随机（800-1000Hz），模拟真实碰撞
- 音量控制在 0.1，不会过于刺耳
- 如果浏览器不支持 Web Audio API，会自动跳过

禁用音效：

```tsx
<CoinDropAnimation playSound={false} />
```

## 🎯 性能优化

- 使用 `requestAnimationFrame` 实现流畅动画
- Canvas 2D 硬件加速
- 金币透明度低于 0.01 时不再绘制
- 动画结束后自动清理资源
- 组件卸载时取消动画帧

## 📱 响应式设计

组件容器固定定位在页面中央，不会影响页面布局：

```css
.coin-drop-animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 不阻止用户交互 */
  z-index: 9999;
}
```

## 🛠️ 高级用法

### 结合 Modal 使用

```tsx
<Modal
  title="任务完成"
  open={modalVisible}
  onOk={() => setModalVisible(false)}
>
  <p>恭喜你获得 20 金币奖励！</p>
  
  <CoinDropAnimation
    visible={modalVisible}
    coinCount={20}
    width={400}
    height={300}
    onComplete={() => console.log('动画完成')}
  />
</Modal>
```

### 结合 useWallet Hook

```tsx
import { useWallet } from '@/hooks/useWallet';

const MyComponent = () => {
  const { balance, refreshBalance } = useWallet();
  const [showCoins, setShowCoins] = useState(false);

  const handleReward = async () => {
    // 触发动画
    setShowCoins(true);
    
    // 刷新余额
    await refreshBalance();
  };

  return (
    <>
      <div>当前余额: {balance} 金币</div>
      <Button onClick={handleReward}>领取奖励</Button>
      
      <CoinDropAnimation
        visible={showCoins}
        coinCount={20}
        onComplete={() => setShowCoins(false)}
      />
    </>
  );
};
```

## 🐛 常见问题

### Q: 动画不显示？
A: 确保 `visible` 属性为 `true`，并且容器有足够的空间。

### Q: 音效不播放？
A: 某些浏览器需要用户交互后才能播放音效，确保在用户点击等操作后触发动画。

### Q: 性能问题？
A: 建议金币数量不超过 100 个，过多金币会影响性能。

### Q: 如何自定义金币样式？
A: 目前金币样式通过 Canvas 绘制，可以修改 `drawCoin` 函数自定义外观。

## 📄 License

MIT License
